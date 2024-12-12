'use server'

import Anthropic from "@anthropic-ai/sdk"
import { GlossaryItem, GlossaryType, ModelsType } from "./_types/glossaryType"
import { GoogleGenerativeAI, HarmCategory, SchemaType, HarmBlockThreshold } from "@google/generative-ai"
import { auth } from "../../auth"
import userModel from "./_models/userModel"
import { claudeCost, openAiCost } from "@/lib/modelPrice"
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
        console.error('[translateText] Error', err)
        throw new Error('Error queueing job. Check logs.')
    }

}

function getPrompt({ glossary, language, text }: {
    glossary: string,
    text: string,
    language: string
}) {
    const filteredGlossary: GlossaryItem[] = JSON.parse(glossary)
    const formattedGlossary = `
                    Glossary -
                    ${filteredGlossary.map(term => `
                        Term: ${term.term},
                        Translation: ${term.translated_term}
                        `).join('')}
                    `
    const prompt = `${formattedGlossary} \n. Please use that glossary to translate this text to ${language} and then return me a list of special terms, skills, and people names extracted from the text that should be included in the glossary. \n ${text}.`
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
            throw new Error(`You've hit the usage limit per hour. Please try again in ${mins}m ${seconds}s`)
        } */

        let prompt

        if (glossary) {
            prompt = getPrompt({
                glossary: glossary,
                language: language,
                text: text
            })
        } else {
            console.log('[Gemini] Prompt 2 used')
            prompt = `Please translate this text to ${language} and return me a list of terms, skills, and people names extracted from the text - \n ${text}`
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
        console.error(err)
        throw err
    }




}




export async function translateGpt({ text, language, glossary }: translateTxtProps) {
    try {
        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Please sign in to use this model.')
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
                language: language
            })

            console.log('[OpenAi] prompt 1 used', prompt)



        } else {
            prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
            console.log('[OpenAi] prompt 2 used')
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
        existingUser.currencyAmt -= openAiCost
        await existingUser.save()
        console.log(`[translateGpt] user currency updated`)
        return jobId
        // const glossaryResponse = z.object({
        //     term: z.string(),
        //     translated_term: z.string()
        // })

        // const translatedTxtResponse = z.object({
        //     glossary: z.array(glossaryResponse),
        //     text: z.string()
        // })

        // const completion = await openAi.beta.chat.completions.parse({
        //     model: 'gpt-4o-mini-2024-07-18',
        //     messages: [
        //         {
        //             role: "system",
        //             content: prompt
        //         }
        //     ],
        //     response_format: zodResponseFormat(translatedTxtResponse, "translation_response"),
        //     max_tokens: 8192,
        // })

        // const translation_response = completion.choices[0].message
        // console.log('[OpenAi] translation response', translation_response)
        // if (translation_response.parsed) {
        //     console.log('[OpenAi] parsed', translation_response.parsed)
        //     return translation_response.parsed
        // } else if (translation_response.refusal) {
        //     console.log('[OpenAi] refusal', translation_response.refusal)
        //     throw new Error(translation_response.refusal)
        // }

    } catch (err) {
        console.error('[translateGpt] Encountered an error, ', err)
        if (err instanceof OpenAI.APIError) {
            if (err.status == 400) {
                throw new Error('Bad request')
            } else if (err.status === 401) {
                throw new Error('Invalid Auth')
            } else if (err.status == 403) {
                throw new Error('Unsupported country, region, or territory.')
            } else if (err.status == 429) {
                throw new Error('Exceeded current quota. Please contact support.')
            } else if (err.status == 500) {
                throw new Error('Server is having issues at the moment. Please try again later.')
            } else if (err.status == 503) {
                throw new Error('Servers are experiencing high traffic. Please try after a brief wait.')
            }
        } else if (err instanceof Error) {
            throw err
        } else {
            console.error('[translateGPT] Unhandled error type')
            throw new Error('Something went wrong. Please try again later.')
        }

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
            language:language
           })

        } else {
            prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
            console.log('prompt 2 used')
        }





        // const message = await client.messages.create({
        //     max_tokens: 8192,
        //     temperature: 0,
        //     tool_choice: {
        //         type: "tool",
        //         name: "translate_text"
        //     },
        //     tools: [
        //         {
        //             name: "translate_text",
        //             description: "Translate text to the language the user wants",
        //             input_schema: {
        //                 type: "object",
        //                 properties: {
        //                     "text": {
        //                         type: "string",
        //                         description: "The translated text. It has to be in the language the user wants"
        //                     },
        //                     "glossary": {
        //                         type: "array",
        //                         terms: {
        //                             type: "object",
        //                             properties: {
        //                                 "term": {
        //                                     type: "string",
        //                                     description: "term name or people name or skill name in the original text's language"
        //                                 },
        //                                 "translated_term": {
        //                                     type: "string",
        //                                     description: "the term or name in the translated language"
        //                                 },
                                        
        //                             },
        //                             required: ["term", "translated_term"]
        //                         },
        //                         description: "Extract a list of special terms, skills, and people names from the text"
        //                     }
        //                 },
        //                 required: ["text", "glossary"]
        //             }
        //         }
        //     ],
        //     messages: [{
        //         role: 'user',
        //         content: [
        //             {
        //                 type: 'text',
        //                 text: prompt
        //             },
        //         ]
        //     }],
        //     model: 'claude-3-5-sonnet-20240620'
        // }) as Anthropic.Message

        // console.log(message)
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
        await existingUser.save()
        console.log(`[TranslateClaude] user currency updated`)
        return jobId
    } catch (err) {
        console.error('[translateClaude] Error', err)
        if (err instanceof Anthropic.APIError) {
            switch (err.status) {
                case 400:
                    throw new Error('Bad request, possibly due to NSFW')
                case 401:
                    throw new Error('Authentication Error')
                case 429:
                    throw new Error('Rate limit Error')
                case 403:
                    throw new Error('Permission denied')
                case 422:
                    throw new Error('Unprocessable Entity Error')
                case 500:
                    throw new Error('Internal server error')
                default:
                    throw new Error('An unknown server error has occured.')
            }
        } else if (err instanceof Error) {

            throw err
        } else {
            console.log('[translateClaude] Hit an unhandled error type')
            throw new Error('Something went wrong. Please try again later.')
        }

    }

}

interface TermLookupProps {
    term: string
    context?: string,
    language: string,
}

export async function TermLookup({ term, context, language }: TermLookupProps) {
    try {
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
        console.error(err)
        throw new Error('Encountered a server error.')
    }
}