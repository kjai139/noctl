'use server'

import Anthropic from "@anthropic-ai/sdk"


const client = new Anthropic({
    apiKey:process.env.CLAUDE_API as string
})


export async function translateTxt (text:string, language:string) {
    try {
        const message = await client.messages.create({
            max_tokens:2048,
            messages: [{
                role: 'user',
                content: `Can you translate the following text to ${language ? language : 'English'} and provide me a list of special terms that you translated from the text (in json format,containing the t field for the original text and the m field for what you translated to) after the translated text in your response, with the array after the label "Glossary:", cutting out everyhing else? - ${text}`,
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