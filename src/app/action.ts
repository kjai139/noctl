'use server'

import Anthropic from "@anthropic-ai/sdk"
import { GlossaryItem, GlossaryType, ModelsType } from "./_types/glossaryType"
import { GoogleGenerativeAI, HarmCategory, SchemaType, HarmBlockThreshold } from "@google/generative-ai"
import { auth } from "../../auth"
import userModel from "./_models/userModel"
import { claudeCost, editCost, openAiCost } from "@/lib/modelPrice"
import { Ratelimit } from '@upstash/ratelimit'
import redis from "@/lib/redis"
import connectToMongoose from "@/lib/mongoose"
import transactionModel from "./_models/transactionModel"
import { CheckoutProduct } from "@/components/stripe/checkoutForm"
import { revalidateTag } from "next/cache"
import { z } from "zod"
import { openAi } from '../lib/openAi'
import { zodResponseFormat } from 'openai/helpers/zod'
import OpenAI, { OpenAIError } from "openai"
import { sqsClient } from '../lib/sqsClient'
import { ListQueuesCommand, SendMessageCommand } from "@aws-sdk/client-sqs"


const client = new Anthropic({
    apiKey: process.env.CLAUDE_API as string
})

interface translateTxtProps {
    text: string,
    language: string,
    glossary?: string
}

const geminiRatelimit = new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(1, '10m')
})

const termLookupRateLimit = new Ratelimit({
    redis:redis,
    limiter: Ratelimit.slidingWindow(1, '10s')

})

export async function createTransactionEntry(product: CheckoutProduct) {
    try {
        await connectToMongoose()
        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Encountered an authentication error. Please try relogging.')
        }

        const existingTransaction = await transactionModel.findOne({
            paymentId: product.pId
        })

        if (existingTransaction) {
            console.log('[createTransEntry]  Pending Payment Id found')

            return existingTransaction._id.toString()
        }
        const expirationTime = 7 * 24 * 60 * 60 * 1000
        //7 days

        const newPendingTrans = new transactionModel({
            paymentId: product.pId,
            userId: session.user.id,
            amount: product.amount,
            transactionType: 'purchase',
            productName: product.productName,
            productDesc: product.productDesc,
            expiresAt: new Date(Date.now() + expirationTime)
        })

        await newPendingTrans.save()
        console.log(`[createTransEntry] Pending entry created, id: ${newPendingTrans._id}`)
        revalidateTag('purchaseH')
        return newPendingTrans._id.toString()


    } catch (err) {
        console.error(err)
        return false
    }
}

export async function DeletePaymentIntentDB(pId: string) {
    try {
        await connectToMongoose()
        const result = await transactionModel.deleteOne({
            pId: pId
        })
        if (result.deletedCount > 0) {
            console.log('[DeletePiDB] Pending PI deleted.')
            return true
        } else {
            console.log(`[DeletePiDB] pId:${pId} not found.`)
            return false
        }

    } catch (err) {
        console.error(err)
        return false
    }
}

async function sendMessageToSQS({ prompt, jobId, model, userId }: {
    prompt: string,
    jobId: string,
    model: ModelsType,
    userId: string
}) {
    try {
        const params = {
            QueueUrl: process.env.SQS_URL,
            MessageBody: JSON.stringify({
                prompt: prompt,
                jobId: jobId,
                model: model,
                userId: userId
            })
        }
        const cmd = new SendMessageCommand(params)
        await sqsClient.send(cmd)
        console.log('[sendMessagetoSQS] Message sent successfully to SQS.')
    } catch (err) {
        console.error('[sendMessageToSQS] Error:', err)
        throw new Error('Encountered an error sending message to QSQ')
    }
}

async function queueJob({ prompt, userId, model }: {
    prompt: string,
    userId: string,
    model: ModelsType

}) {
    const ttl = 3600
    const jobId = `jb-${Date.now()}`
    const job = {
        id: jobId,
        userId: userId,
        prompt: prompt,
        status: 'pending',
        model: model
    }
    try {
        await redis.set(jobId, JSON.stringify(job), { ex: ttl })
        console.log(`[translateText] Pending Job ${job.id} saved.`)
        await sendMessageToSQS({
            prompt: prompt,
            jobId: jobId,
            model: model,
            userId: userId
        })
        return jobId

    } catch (err) {
        console.error('[translateText] Encountered an error queueing job', err)
        throw new Error('Encountered a server error -_-. Please try again later.')
    }

}

function getPrompt({ glossary, language, text, model }: {
    glossary: string,
    text: string,
    language: string,
    model: 'standard' | 'b1' | 'b2'
}) {
    const filteredGlossary: GlossaryItem[] = JSON.parse(glossary)
    const formattedGlossary = `
                    Word list:
                    ${filteredGlossary.map(term => `
                        Term: ${term.term},
                        Translation: ${term.translated_term}
                        `).join('')}
                    `
    let prompt
    if (model === 'standard') {
        prompt = `${formattedGlossary}\n. Please use that word list to translate the following text to ${language} and include a list of special terms, skills, and people names from the text in the dictionary. Make sure you use the ${language} version of the translated words if possible. \n ${text}`
    } else {
        prompt = `${formattedGlossary} \n. Please use that glossary to translate the text in <<< >>> to ${language} while keeping the same format, and then return me a list of special terms, skills, and people names extracted from the text. <<<\n ${text}>>>`
    }
    
    return prompt

}


export async function translateGemini({ text, language, glossary }: translateTxtProps) {
    try {
        const session = await auth()
        if (!session || !session.user) {
            throw new Error('Encountered an authentication error. Please sign in to use this model.')
        }

        if (!session.user.id) {
            throw new Error('Encountered a server error. Please try relogging.')
        }

        /* const { success, remaining, reset } = await geminiRatelimit.limit(session.user.id)
        if (!success) {
            
            const remainingTime = reset - Date.now()
            const mins = Math.floor(remainingTime / 60000)
            const seconds = Math.floor((remainingTime / 60000) / 1000)
            console.log(reset, remainingTime, mins, seconds)
            throw new Error(`[Free Model] You've hit the usage limit. Please try again in ${mins}m ${seconds}s or switch to another model.`)
        } */

        let prompt

        if (glossary) {
            prompt = getPrompt({
                glossary: glossary,
                language: language,
                text: text,
                model: 'standard'
            })
        } else {
            console.log('[Gemini] Prompt 2 used')
            prompt = `Please translate the following text to ${language} and extract a list of special terms, skills, and people names from the text. Keep the original format and maintain the same linebreaks as the original text. \n ### Text \n ${text}`
        }

        //Making job on redis and starting lambda
        const params: {
            model: ModelsType,
            prompt: string,
            userId: string
        } = {
            model: 'standard',
            prompt: prompt,
            userId: session.user.id
        }
        const jobId = await queueJob(params)
        return jobId


    } catch (err) {
        console.error('[TranslateGemini] Error: ', err)
        throw err
    }




}




export async function testGemini(params:any) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API as string)
    const schema = {
        description: "Response containing translated line of text and a dictionary",
        type:SchemaType.OBJECT,
        properties: {
            lines: {
                type:SchemaType.ARRAY,
                description: "Each line of translated text in the response",
                items: { type: SchemaType.STRING }
            },
            dictionary: {
                type:SchemaType.ARRAY,
                description: "A list of term and it's meaning in the response",
                nullable: true,
                items: {
                    type:SchemaType.OBJECT,
                    properties: {
                        term: {
                            type:SchemaType.STRING,
                            description: 'The untranslated term in raw text'
                        },
                        translated_term: {
                            type:SchemaType.STRING,
                            description:'The translated term'
                        }
                    }

                }
                
            }
        },
        required: ['lines', 'dictionary']
    }


    const model = genAI.getGenerativeModel({
        model: 'gemini-2.0-flash',
        generationConfig: {
            temperature: 0,
            responseMimeType:'application/json',
            responseSchema: schema
        }
    })

    let prompt
    if (params.glossary) {
        prompt = getPrompt({
            glossary: params.glossary,
            text: params.text,
            language: params.language,
            model: 'standard'
        })
    } else {
        prompt = `Please translate the following text to ${params.language} and include a list of special terms, skills, and people names from the text in the dictionary. Make sure you use the ${params.language} version of the translated words if possible. \n ${params.text}`
    }
    
    const result = await model.generateContent(prompt)
    console.log('[Gemini result]', result)
    return result.response.text()
}




export async function translateGpt({ text, language, glossary }: translateTxtProps) {
    try {
        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Encountered an authentication error. Please sign in to use this model.')
        }

        const existingUser = await userModel.findById(session.user.id)

        if (!existingUser) {
            throw new Error('Encountered a server error. Please try relogging.')
        }
        if (existingUser.currencyAmt < openAiCost) {
            throw new Error('You do not have enough currency to use this model. Purchase more at the currency tab.')
        }

        let prompt
        if (glossary) {
            prompt = getPrompt({
                glossary: glossary,
                text: text,
                language: language,
                model: 'b2'
            })

            console.log('[OpenAi] prompt 1 used', prompt)



        } else {
            prompt = `Please translate the following text to ${language} while keeping the same line breaks and format, and extract a list of special terms, skills, and people names. \n ### Text \n ${text}`
            /* prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}` */
            console.log('[OpenAi] prompt:', prompt)
        }
        const params: {
            model: ModelsType,
            prompt: string,
            userId: string
        } = {
            model: 'b2',
            prompt: prompt,
            userId: session.user.id
        }
        const jobId = await queueJob(params)
        const UserCurrencyAmt:number = existingUser.currencyAmt
        const updatedUsercur:number = UserCurrencyAmt - openAiCost
        existingUser.currencyAmt = updatedUsercur
        try {
            await existingUser.save()
        } catch (err) {
            console.error('[translateGpt] Error saving to DB.', err)
            throw new Error('Encountered a server error *_*. Please try again later.')
        }
        
        console.log(`[translateGpt] user currency updated: ${UserCurrencyAmt} - ${openAiCost} = ${updatedUsercur}`)
        return jobId
        

    } catch (err) {
        console.error('[translateGpt] Encountered an error, ', err)
        throw err

    }
}


export async function translateClaude({ text, language, glossary }: translateTxtProps) {
    try {

        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Please sign in to use this model.')
        }

        const existingUser = await userModel.findById(session.user.id)

        if (!existingUser) {
            throw new Error('Encountered a server error. Please try relogging.')
        }
        if (existingUser.currencyAmt < claudeCost) {
            throw new Error('You do not have enough currency to use this model. Purchase more at the currency tab.')
        }

        let prompt
        if (glossary) {
           prompt = getPrompt({
            glossary:glossary,
            text:text,
            language:language,
            model: 'b1'
           })

        } else {
            prompt = `Please translate the text in <<< >>> to ${language} while keeping the same format, and extract a list of special terms, skills, and people names from the text. \n <<< ${text} >>>`
            console.log('prompt 2 used')
        }


        const params: {
            model: ModelsType,
            prompt: string,
            userId: string
        } = {
            model: 'b1',
            prompt: prompt,
            userId: session.user.id
        }
        const jobId = await queueJob(params)
        existingUser.currencyAmt -= claudeCost
        try {
            await existingUser.save()
        } catch (err) {
            console.error('[TranslateClaude] Error updating user:', err)
            throw new Error('Encountered a server error *_*, please try again later.')
        }
        
        console.log(`[TranslateClaude] user currency updated`)
        return jobId
    } catch (err) {
        console.error('[translateClaude] Error', err)
        throw err
       

    }

}


interface ClaudeEditProps {
    prompt: string
}

export async function ClaudeEdit ({prompt}:ClaudeEditProps) {

    
    try {

        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Please sign in to use this model.')
        }

        const existingUser = await userModel.findById(session.user.id)

        if (!existingUser) {
            throw new Error('Encountered a server error. Please try relogging.')
        }
        if (existingUser.currencyAmt < editCost) {
            throw new Error('You do not have enough currency to use this function. Purchase more at the currency tab.')
        }
        /* const textPrompt = `Please review this text line by line, checking its translation by comparing the lines. Remove any hallucinations and make improvements where you can, and then return a list of lines. \n ###Text \n 
        그렇다 할지라도!
        Even if that’s the case!

        좋아하는 게임에 캐릭터가 되어달라는 제안을 어떤 게이머가 거절할 수 있나.
        What gamer could possibly refuse the offer to become a character in their favorite game?
        ` */

        const params: {
            model: ModelsType,
            prompt: string,
            userId: string
        } = {
            model: 'e1',
            prompt: prompt,
            userId: session.user.id
        }
        const jobId = await queueJob(params)
        existingUser.currencyAmt -= editCost
        try {
            await existingUser.save()
        } catch (err) {
            console.error('[ClaudeEdit] Error updating user:', err)
            throw new Error('Encountered a server error *_*, please try again later.')
        }

        console.log(`[ClaudeEdit] user currency updated`)
        return jobId


        /* const message = await client.messages.create({
            model: "claude-3-5-sonnet-20241022",
            max_tokens: 8192,
            temperature: 0.2,
            tool_choice: {
                type: 'tool',
                name: 'edit_translated_text'
            },
            tools: [
                {
                    name: "edit_translated_text",
                    description: "To make improvements and remove any hallucinations from the translated text.",
                    input_schema: {
                        type:"object",
                        properties: {
                            "result_array": {
                                type:"array",
                                translated_line: {
                                    type:"string",
                                    description:"The translated line after checking for hallucination and improvements."
                                }

                            }
                        }
                    }
                }
            ],
            messages: [{
                role: "user",
                content: prompt
            }],
            
        })
        console.log('[claudeEdit] message', message)
        return message.content */
    } catch (err) {
        console.error('[claudeEdit] Error', err)
        throw err
    }
}

interface TermLookupProps {
    term: string
    context?: string,
    language: string,
}

export async function TermLookup({ term, context, language }: TermLookupProps) {
    try {
        
        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Encountered an authentication error. Please try relogging.')
        }
             
        
        const { success, remaining, reset } = await termLookupRateLimit.limit(`${session.user.id}-termRate`)
        if (!success) {
            throw new Error(`You're doing too much! Please wait a few seconds before trying again!`)
        }
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API as string)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 0.75,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            explanation: {
                                type: SchemaType.STRING,
                                description: 'explanation of the word'
                            },
                            translated_term: {
                                type: SchemaType.STRING,
                                description: 'Meaning of the word. No brackets'
                            }

                        }
                    }
                }
            },

        })

        const prompt = `What is "${term}" in ${language} ? ${context ? `in this context? ${context}` : ''}`

        const result = await model.generateContent(prompt)
        console.log('gem result:', result)

        return result.response.text()
    } catch (err) {
        console.error('[Termlookup] Error' , err)
        throw err
    }
}