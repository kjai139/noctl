'use server'

import Anthropic from "@anthropic-ai/sdk"
import { GlossaryItem, GlossaryType } from "./_types/glossaryType"
import { GoogleGenerativeAI, HarmCategory, SchemaType, HarmBlockThreshold } from "@google/generative-ai"
import { auth } from "../../auth"
import userModel from "./_models/userModel"


const client = new Anthropic({
    apiKey:process.env.CLAUDE_API as string
})

interface translateTxtProps {
    text:string,
    language:string,
    glossary?:string
}


export async function translateGemini({text, language, glossary}:translateTxtProps) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API as string)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold:HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                {
                    category:HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH
                },
                
            ],
            generationConfig: {
                temperature: 0,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: {
                        type:SchemaType.OBJECT,
                        properties: {
                            translation: {
                                type: SchemaType.STRING,
                                description:'The translation of the text which the user prompted for'
                            },
                            glossary: {
                                type:SchemaType.OBJECT,
                                description:'A glossary of term names, skill names, and people names extracted from the text',
                                properties: {
                                        terms: {
                                            type:SchemaType.ARRAY,
                                            description: "A list of terms, skills, and names",
                                            items: {
                                                type:SchemaType.OBJECT,
                                                properties: {
                                                    term:{
                                                        type:SchemaType.STRING,
                                                        description: "term name or people name or skill name in the original text's language"
                                                    },
                                                    definition:{
                                                        type:SchemaType.STRING,
                                                        description:"the term or name in the translated language"
                                                    },
                                                    term_type : {
                                                        type:SchemaType.STRING,
                                                        description:"term | name | skill"
                                                    }
                                                    /* confidence_level: {
                                                        type:SchemaType.STRING,
                                                        description:"The confidence level of the translation's accuracy on a scale of 1-10"
                                                    } */
                                                }
                                            }
                                        },
                                        
                                        
                                        

                                    }
                                
                            }
                           
                        }
                    }
                }
            },
            
        })

        let prompt

        if (glossary) {
            const filteredGlossary:GlossaryItem[] = JSON.parse(glossary)
            const formattedGlossary = `
            Glossary -
            ${filteredGlossary.map(term => `
                Term: ${term.term},
                Translation: ${term.definition}
                `).join('')}
            `
            prompt = `${formattedGlossary} \n. Please use the glossary to translate this text to ${language} - \n ${text} -END OF TEXT. And return me a list of special terms, skills, and people names extracted from the text.`
        } else {
             prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
        }

        const result = await model.generateContent(prompt)
        console.log('gem result:', result)

        return result.response.text()
    } catch (err:any) {
        console.error(err.message)
        let errMsg
        if (err.message) {
            errMsg = err.message.toLowerCase()
            if (errMsg.includes('safety')) {
                throw new Error('No NSFW / dangerous / offensive content.')
            } else if (errMsg.includes('rate limit')) {
                throw new Error('Encountered a rate limit error. Please try again later.')
            } else if (err.Msg.includes('unauthorized') || errMsg.includes('invalid api key') || errMsg.includes('missing token')) {
                throw new Error('Encountered an authorization error. Please try again later.')
            }
        } else {
            throw new Error('An unknown server error has occured. Please try again later.')
        }
        
        
    }

}


export async function translateTxtNoTool ({text, language, glossary}:translateTxtProps) {
    try {
        let jsonGlossary
        let filteredGlossary:GlossaryItem[]
        let formattedGlossary 
        let prompt
        if (glossary) {
            jsonGlossary = JSON.parse(glossary)
            console.log('OG GLOSSARY - ',jsonGlossary )
            filteredGlossary = jsonGlossary
            console.log('filteredlist', filteredGlossary)
            formattedGlossary = `
            Glossary -
            ${filteredGlossary.map(term => `
                Term: ${term.term},
                Translation: ${term.definition}
                `).join('')}
            `
            console.log('formattedGLoss', formattedGlossary)
            if (filteredGlossary.length > 0) {
                prompt = `${formattedGlossary} \n. Please use the glossary to translate this text to ${language} - \n ${text} -END OF TEXT. And return me a list of special terms, skills, and people names extracted from the text.`
                console.log('prompt 1 used', prompt)
            } else {
                prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
                console.log('prompt 2 used')
            }
            
        } else {
            prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
            console.log('prompt 2 used')
        }

        const message = await client.messages.create({
            max_tokens:8192,
            temperature: 0,
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt
                    },
                ]
            }],
            model: 'claude-3-5-sonnet-20240620'
        })

        return message.content
    } catch (err) {
        console.error(err)
    }
}


export async function translateTxt ({text, language, glossary}:translateTxtProps) {
    try {

        const session = await auth()
        if (!session || !session.user) {
            throw new Error('User is not logged in.')
        }

        const existingUser = await userModel.findById(session.user.id)
        


        /* const normalizedtext = text.toLowerCase()
        .replace(/[(){}\[\]<>]/g, ' ')  
        .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
        console.log(normalizedtext) */
        /* const words = new Set(normalizedtext.split(/\s+/))
        console.log('Word set:', words) */
        let jsonGlossary
        let filteredGlossary:GlossaryItem[]
        let formattedGlossary 
        let prompt
        if (glossary) {
            jsonGlossary = JSON.parse(glossary)
            console.log('OG GLOSSARY - ',jsonGlossary )
            filteredGlossary = jsonGlossary
            /* filteredGlossary = jsonGlossary.filter((entry:GlossaryItem) => normalizedtext.includes(entry.term)) */
            //set with words.has doesnt check partial
            console.log('filteredlist', filteredGlossary)
            formattedGlossary = `
            Glossary -
            ${filteredGlossary.map(term => `
                Term: ${term.term},
                Translation: ${term.definition}
                `).join('')}
            `
            console.log('formattedGLoss', formattedGlossary)
            if (filteredGlossary.length > 0) {
                prompt = `${formattedGlossary} \n. Please use the glossary to translate this text to ${language} - \n ${text} -END OF TEXT. And return me a list of special terms, skills, and people names extracted from the text.`
                console.log('prompt 1 used', prompt)
            } else {
                prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
                console.log('prompt 2 used')
            }
            
        } else {
            prompt = `Please translate this text to ${language} and extract a list of special terms, skills, and people names from the text - \n ${text}`
            console.log('prompt 2 used')
        }
        




        const message = await client.messages.create({
            max_tokens:8192,
            temperature: 0,
            tool_choice:{
                type:"tool",
                name:"translate_text"
            },
            tools: [
                {
                    name:"translate_text",
                    description: "Translate text to the language the user wants",
                    input_schema: {
                        type:"object",
                        properties: {
                            "text": {
                                type: "string",
                                description: "The translated text. It has to be in the language the user wants"
                            },
                            "glossary": {
                                type:"array",
                                terms: {
                                    type:"object",
                                    properties: {
                                        "term": {
                                            type:"string",
                                             description: "term name or people name or skill name in the original text's language"
                                        },
                                        "definition": {
                                            type:"string",
                                            description:"the term or name in the translated language"
                                        },
                                        "term_type": {
                                            type:"string",
                                            description:"term | name | skill"
                                        }
                                    },
                                    required:["term", "definition"]
                                },
                                description:"Extract a list of special terms, skills, and people names from the text"
                            }
                        },
                        required:["text", "glossary"]
                    }
                }
            ],
            messages: [{
                role: 'user',
                content: [
                    {
                        type: 'text',
                        text: prompt
                    },
                ]
            }],
            model: 'claude-3-5-sonnet-20240620'
        }) as Anthropic.Message
    
        console.log(message)
        return message.content
    } catch (err) {
        console.error(err)
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
        } else {
            throw err
        }
        
    }
    
}

interface TermLookupProps {
    term: string
    context?:string,
    language: string,
}

export async function TermLookup ({term, context, language}:TermLookupProps) {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API as string)
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            generationConfig: {
                temperature: 1,
                responseMimeType: 'application/json',
                responseSchema: {
                    type: SchemaType.ARRAY,
                    items: {
                        type:SchemaType.OBJECT,
                        properties: {
                            response: {
                                type: SchemaType.STRING,
                                description:'The meaning of the word the user prompted for'
                            },
                            translation: {
                                type:SchemaType.STRING,
                                description:'The direct translation of the word. Do not include anything else. Return null if not applicable'
                            }
                           
                        }
                    }
                }
            },
            
        })

        const prompt = `What does ${term} mean${context ? `in this context? ${context}` : ''}\n Please answer in ${language}`

        const result = await model.generateContent(prompt)
        console.log('gem result:', result)

        return result.response.text()
    } catch (err) {
        console.error(err)
        throw new Error('Encountered a server error.')
    }
}