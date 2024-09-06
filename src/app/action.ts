'use server'

import Anthropic from "@anthropic-ai/sdk"
import { GlossaryItem, GlossaryType } from "./_types/glossaryType"


const client = new Anthropic({
    apiKey:process.env.CLAUDE_API as string
})

interface translateTxtProps {
    text:string,
    language:string,
    glossary?:string
}



export async function translateTxt ({text, language, glossary}:translateTxtProps) {
    try {
        const normalizedtext = text.toLowerCase()
        .replace(/[(){}\[\]<>]/g, ' ')  
        .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
        console.log(normalizedtext)
        const words = new Set(normalizedtext.split(/\s+/))
        console.log('Word set:', words)
        let jsonGlossary
        let filteredGlossary
        let formattedGlossary
        if (glossary) {
            jsonGlossary = JSON.parse(glossary)
            console.log('OG GLOSSARY - ',jsonGlossary )
            filteredGlossary = jsonGlossary.filter((entry:GlossaryItem) => normalizedtext.includes(entry.term))
            //set with words.has doesnt check partial
            console.log('filteredlist', filteredGlossary)
            formattedGlossary = `
            Glossary -
            ${filteredGlossary.map(term => `
                Term:${term.term},
                Translation:${term.definition}
                `).join('')}
            `
            console.log('formattedGLoss', formattedGlossary)
        }
        

        let prompt
        if (glossary) {
            prompt = `You are a very precise translator for novels. You will always use the glossary's translation for specific term translations over your own.${formattedGlossary}. Please translate the following text into ${language ? language : 'English'} - ${text}.`
            console.log('prompt 1 used', prompt)
        } else {
            prompt = `You are a very precise translator for novels. Please translate the following text into ${language ? language : 'English'}. And also return me a list of glossary of uncommon terms from the text you translated, but always include the whole word and do not break the terms. Here's the text to be translated - ${text}`
            console.log('prompt 2 used')
        }




        const message = await client.messages.create({
            max_tokens:8192,
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
                                description: "The translated text that is NOT the original text"
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
                                description:"A glossary list of special, uncommon terms taken from the text, each with a term and a definition"
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