'use server'

import Anthropic from "@anthropic-ai/sdk"
import { GlossaryItem, GlossaryType } from "./_types/glossaryType"
import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"


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
    } catch (err) {
        console.error(err)
        throw new Error('Encountered a server error.')
    }

}



export async function translateTxt ({text, language, glossary}:translateTxtProps) {
    try {
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
                prompt = `You are a very precise translator for novels. You will always use the glossary's translation for specific term translations over your own.${formattedGlossary}. Please translate the following text into ${language ? language : 'English'} - ${text}. Please also return me a list of glossary of uncommon terms and names from the text you translated.`
                console.log('prompt 1 used', prompt)
            } else {
                prompt = `You are a very precise translator for novels. Please translate the following text into ${language ? language : 'English'}. And also return me a list of glossary of uncommon terms from the text you translated, but always include the whole word and do not break the terms. Here's the text to be translated - ${text}`
                console.log('prompt 2 used')
            }
            
        } else {
            prompt = `You are a very precise translator for novels. Please translate the following text into ${language ? language : 'English'}. And also return me a list of glossary of uncommon terms from the text you translated, but always include the whole word and do not break the terms. Here's the text to be translated - ${text}`
            console.log('prompt 2 used')
        }




        const message = await client.messages.create({
            max_tokens:8192,
            temperature: 0,
            tool_choice:{
                type:"tool",
                name:"translate_with_glossary"
            },
            tools: [
                {
                    name:"translate_with_glossary",
                    description: "Translates text from one language into another with the user's glossary",
                    input_schema: {
                        type:"object",
                        properties: {
                            "text": {
                                type: "string",
                                description: "The translated text in the language the user requested for. It has to be grammatically correct"
                            },
                            "glossary": {
                                type:"array",
                                items: {
                                    type:"object",
                                    properties: {
                                        "term": {
                                            type:"string",
                                            description:"The untranslated original term. The term MUST be whole phrase and not break words apart, especially in asian languages"
                                        },
                                        "definition": {
                                            type:"string",
                                            description:"The translation that was used for the term"
                                        },
                                        "confident_level": {
                                            type:"number",
                                            description:"The confident level of the definition's accuracy on a scale of 1-10"
                                        }
                                    },
                                    required:["term", "definition"]
                                },
                                description:"A glossary list of special, uncommon terms, and names taken from the text that wasn't already in the user's glossary"
                            }
                        },
                        required:["text", "glossary"]
                    }
                }
            ],
            messages: [{
                role: 'user',
                content: prompt
            }],
            model: 'claude-3-5-sonnet-20240620'
        })
    
        console.log(message)
        return message.content
    } catch (err) {
        console.error(err)
        throw err
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