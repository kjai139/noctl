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
        const normalizedtext = text.toLowerCase().replace(/[^\w\s]/g, '')
        const words = new Set(normalizedtext.split(/\s+/))
        let jsonGlossary
        let filteredGlossary
        if (glossary) {
            jsonGlossary = JSON.parse(glossary)
            filteredGlossary = JSON.stringify(jsonGlossary.filter((entry:GlossaryItem) => words.has(entry.term)))
        }


        const message = await client.messages.create({
            max_tokens:4096,
            messages: [{
                role: 'user',
                content: `Please translate the following text to ${language ? language : 'English'} ${glossary ? "while making sure that the terms matches the glossary I provide" : ","} and provide me a list of special terms you translated ${glossary ? "that aren't already included in the glossary" : ""} in the following json format. If there are lines you are unsure of, it's okay to be unsure but please include them in the "unsure" field of the json response with the line in its original language in the line field and a certainty rating of either "unsure" or "very unsure" so I can check on them. Do not include anything else in your response other than the json object.

                JSON format - 
                {"content":"", "glossary":[{"term": "(lower case the terms if applicable)", "translation":""}], "unsure":[{"line":"", "translation":"", "certainty":""}]}
                
                
                Text to be translated- ${text} ${glossary ? `The glossary - ${filteredGlossary}` : "."}`,
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