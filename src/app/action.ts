'use server'

import Anthropic from "@anthropic-ai/sdk"


const client = new Anthropic({
    apiKey:process.env.CLAUDE_API as string
})


export async function translateTxt (text:string, language:string) {
    try {
        const message = await client.messages.create({
            max_tokens:4096,
            messages: [{
                role: 'user',
                content: `Please translate the following text to ${language ? language : 'English'} and provide me a list of special terms that you translated in the following json format, cutting out everyhing else. If there are lines you are unsure of, it's okay to be unsure but please include them in the "unsure" field of the json response with the line in its original language in the line field and a certainty rating of either "unsure" or "very unsure" so I can check on them. Do not include anything else in your response other than the json object.

                JSON format - 
                {"content":"", "glossary":[{"term": "", "translation":""}], "unsure":[{"line":"", "translation":"", "certainty":""}]}
                
                
                Text to be translated- ${text}`,
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