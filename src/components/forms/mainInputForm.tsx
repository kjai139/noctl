"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { translateGemini, translateTxt } from "@/app/action";
import { useWorkState } from "@/app/_contexts/workStateContext";
import GlossaryTable from "../tables/glossaryTable";
import { useEffect, useState } from "react";
import { GlossaryItem, GlossaryType, ModelsType } from "@/app/_types/glossaryType";
import ChunkCarousel from "../carousels/chunkCarousel";
import AiModelSelect from "../select/aiModelSelect";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import ErrorResultAlert from "../dialog/errorResult";


const tokenLimit = 10000
const textLimit = 2000

const language = [
    {
        name:'Japanese'
    },
    {
        name:'Korean'
    },
    {
        name:'English'
    },
    {
        name:'Chinese'
    }

]

const languageChoices = language.map(item => item.name)

const formSchema = z.object({
    language: z.string({
        message: 'Please choose a language'
    }).refine(value => languageChoices.includes(value), {
        message: 'Please choose a language'
    }),
    targetText: z.string().max(tokenLimit, {
        message: `Cannot exceed ${tokenLimit} tokens per request.`
    })
})

function TextAreaWatched ({control}:{control: Control<z.infer<typeof formSchema>>}) {
    const textarea = useWatch({
        control,
        name: 'targetText',
        defaultValue:''
    })

    return <p>{textarea.length} / {tokenLimit}</p>
}

export default function MainInputForm () {
    const {setGlossary, curResult, setCurResult, glossary, setUnsure, isLoading, setIsLoading, chunks, setChunks} = useWorkState()

    const [selectedChunk, setSelectedChunk] = useState<number | null>(null)

    const [isSplitDone, setIsSplitDone] = useState(false)
    const [aiModel, setAiModel] = useState<ModelsType>('Standard')
    const [errorMsg, setErrorMsg] = useState('')
    
    const form = useForm<z.infer<typeof formSchema>>({
        resolver:zodResolver(formSchema),
        defaultValues: {
            language: 'English'
        }
    })

    const onSubmitTest = async (values: z.infer<typeof formSchema>) => {
        if (values.targetText.length > textLimit) {
            console.log(`Text too long. ${values.targetText.length} / ${textLimit} Splitting...`)
            
            const firstPage = splitTextIntoChunks(values.targetText)
            console.log('first page:', firstPage)
            apiLookUp({
                text: firstPage,
                language: values.language,
                model: aiModel
            })
            

        } else {
            apiLookUp({
                text:values.targetText,
                language:values.language,
                model:aiModel
            })
        }
        
        
        
    }

    const setTxtareaContent = (content:string) => {
        form.setValue('targetText', content)
    }

    interface apiLookUpProps {
        text:string,
        language:string,
        model: ModelsType
    }

    

    const apiLookUp = async ({text, language, model}:apiLookUpProps) => {
        setIsLoading(true)
        try {
            let normalizedGlossary
            let filteredGlossary
            const normalizedtext = text.toLowerCase()
            .replace(/[(){}\[\]<>]/g, ' ')  
            .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
            
            if (glossary.length > 0) {
                normalizedGlossary = glossary.map((entry) => {
                    return (
                        {
                            ...entry,
                            term: entry.term.toLowerCase(),
                            
                        }
                    )
                })

                if (normalizedGlossary) {
                    filteredGlossary = normalizedGlossary.filter((entry:GlossaryItem) => normalizedtext.includes(entry.term))
                }

                
            }

            
            console.log('Non filtered Glossary:', glossary)
            console.log('Filtered Glossary:', filteredGlossary)

            const params = {
                text:text,
                language: language,
                ...(glossary.length > 0 && {glossary:JSON.stringify(filteredGlossary)})
            }
            console.log('Params used:', params)

            if (model === 'Standard') {
                const result = await translateGemini(params)
                console.log(result)
                const jsonResult = JSON.parse(result)
                console.log(jsonResult)
                const glossaryResult = jsonResult[0].glossary

                if (normalizedGlossary && normalizedGlossary.length > 0) {
                    console.log('Normalized Glossary used')
                    const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                    glossaryResult.forEach((newentry:GlossaryItem) => {
                        if (!termSet.has(newentry.term.toLowerCase())){
                            termSet.add(newentry.term)
                            normalizedGlossary.unshift(newentry)
                        } else {
                            console.log(`Entry ${newentry.term} already exists.`)
                        }
                    })
                    setGlossary(normalizedGlossary)
                } else {
                    setGlossary(glossaryResult)
                }

                setCurResult(jsonResult[0].translation)

            } else if (model === 'Alt-1') {
                const result = await translateTxt(params)
                console.log('Api response:', result)

                if (result && result[0]) {
                    if (result[0].type === 'tool_use') {
                        const textResult = result[0].input.text
                        const glossaryResult = result[0].input.glossary
                    
                        //add new entries if not dupe - backend should only return normalized results
                        if (normalizedGlossary && normalizedGlossary.length > 0) {
                            console.log('Normalized Glossary used')
                            const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                            glossaryResult.forEach((newentry:GlossaryItem) => {
                                /* let normalizedterm = newentry.term.toLowerCase() */
                                if (!termSet.has(newentry.term.toLowerCase())){
                                    termSet.add(newentry.term)
                                    normalizedGlossary.unshift(newentry)
                                } else {
                                    console.log(`Entry ${newentry.term} already exists.`)
                                }
                            })
                            setGlossary(normalizedGlossary)
                        } else {
                            setGlossary(glossaryResult)
                        }
                        
                        
                        
                        
                        setCurResult(textResult)
                        
                    
                    }
                    
                }
            }
            
            setIsLoading(false)
        } catch (err) {
            console.error(err, typeof err)
            setErrorMsg('Encountered an API error. If problem persists, change the model')
           
            setIsLoading(false)
            
            
        }
    }

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        console.log('submitted', values)
        setIsLoading(true)
        try {
            let targetText
            if (values.targetText.length > textLimit) {
                console.log(`Text too long. ${values.targetText.length} / ${textLimit} Splitting...`)
                
                const firstPage = splitTextIntoChunks(values.targetText)
                console.log('first page:', firstPage)
                targetText = firstPage
    
            }
            let normalizedGlossary
            let filteredGlossary
            const normalizedtext = values.targetText.toLowerCase()
            .replace(/[(){}\[\]<>]/g, ' ')  
            .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
            
            if (glossary.length > 0) {
                normalizedGlossary = glossary.map((entry) => {
                    return (
                        {
                            ...entry,
                            term: entry.term.toLowerCase(),
                            
                        }
                    )
                })

                if (normalizedGlossary) {
                    filteredGlossary = normalizedGlossary.filter((entry:GlossaryItem) => normalizedtext.includes(entry.term))
                }

                
            }

            
            console.log('Non filtered Glossary:', glossary)
            console.log('Filtered Glossary:', filteredGlossary)

            const params = {
                text:values.targetText,
                language: values.language,
                ...(glossary.length > 0 && {glossary:JSON.stringify(filteredGlossary)})
            }
            console.log('Params used:', params)
            const result = await translateTxt(params)
            console.log('Api response:', result)

            if (result && result[0]) {
                if (result[0].type === 'tool_use') {
                    const textResult = result[0].input.text
                    const glossaryResult = result[0].input.glossary
                   
                    //add new entries if not dupe - backend should only return normalized results
                    if (normalizedGlossary && normalizedGlossary.length > 0) {
                        console.log('Normalized Glossary used')
                        const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                        glossaryResult.forEach((newentry:GlossaryItem) => {
                            /* let normalizedterm = newentry.term.toLowerCase() */
                            if (!termSet.has(newentry.term.toLowerCase())){
                                termSet.add(newentry.term)
                                normalizedGlossary.unshift(newentry)
                            } else {
                                console.log(`Entry ${newentry.term} already exists.`)
                            }
                        })
                        setGlossary(normalizedGlossary)
                    } else {
                        setGlossary(glossaryResult)
                    }
                    
                    
                    
                    
                    setCurResult(textResult)
                    
                
                }
                
            }
            setIsLoading(false)
        } catch (err) {
            console.error(err)
           
            setIsLoading(false)
        }
    }

    /* const handlePaste = (e) => {
        const copyData = e.clipboardData.getData('text')
        console.log('COPYDATA-', copyData)
        if (copyData && copyData.length > textLimit) {
            splitTextIntoChunks(copyData)
        }
    } */

    const splitTextIntoChunks = (text:string) => {
        setChunks([])
        const splitTxtLimit = textLimit - 100
        let currentChunk = ''
        let chunks:string[] = []
        const lines = text.split('\n');
        const sentences = text.split('\n');
        let currentSentence = ""

    

        console.log('Sentences:', sentences)
        for (let sentence of sentences) {
            sentence = sentence + '\n'
            if ((currentChunk + sentence).length > splitTxtLimit) {
                chunks.push(currentChunk)
                currentChunk = sentence
            } else {
                currentChunk += sentence
            }
        }

        if (currentChunk) {
            chunks.push(currentChunk)
        }

        setChunks(chunks)
        setSelectedChunk(0)
        setTxtareaContent(chunks[0])
        return chunks[0]
       

    }

    useEffect(() => {
        console.log('main re-rendered')
    })

    


    const setCurResultHandle = () => {
        const text = `test text`
        setCurResult(text)
    }

  
   
    return (
        <div className="flex gap-8 justify-center">
            {
                errorMsg ?
                <ErrorResultAlert errorMsg={errorMsg} setErrorMsg={setErrorMsg}></ErrorResultAlert>
                : null

            }
            
            <div>
                {/* <Button onClick={setCurResultHandle}>Test output</Button> */}
        <GlossaryTable glossary={glossary} setGlossary={setGlossary}></GlossaryTable>
        </div>
        <div className="justify-center items-center flex">
            <FaArrowRightArrowLeft size={24}></FaArrowRightArrowLeft>
        </div>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitTest)} className="flex gap-4 flex-col">
                <div className="flex gap-4 mx-2">
                <FormField
                control={form.control}
                name="language"
                render={({field}) => (
                    
                    <FormItem>
                        
                        <FormLabel className="whitespace-nowrap">Output Language</FormLabel>
                        
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Language">
                                    </SelectValue>
                                </SelectTrigger>
                            </FormControl>
                                <SelectContent>
                                    {
                                        language.map((node, idx) => {
                                            return (
                                                <SelectItem value={node.name} key={`lg-${idx}`}>
                                                       {node.name} 
                                                </SelectItem>
                                            )
                                        })
                                    }
                                </SelectContent>
                            
                            </Select>
                        
                    </FormItem>
                    
                )}
                >

                </FormField>

                {/* cara */}
                <ChunkCarousel setTextArea={setTxtareaContent} selectedChunk={selectedChunk} setSelectedChunk={setSelectedChunk}></ChunkCarousel>
    
                </div>
                <div className="flex flex-col gap-4 main-wrap border-4 border-transparent rounded-xl">
                <FormField control={form.control}
                name="targetText"
                render={({field}) => (
                    <FormItem>
                            <FormControl>
                                <Textarea maxLength={13000} onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }} placeholder="Enter text..." {...field} className="min-w-[300px] sm:min-w-[600px] max-h-[650px] border-none shadow-none resize-none main-ta focus-visible:ring-0" disabled={isLoading}>

                                </Textarea>
                                
                            </FormControl>
                            
                        
                    </FormItem>
                )}
                >

                </FormField>
                <div className="justify-end flex gap-2 items-center p-2 pb-1">
                    <AiModelSelect setModel={setAiModel}></AiModelSelect>
                <div className="text-destructive p-0 flex gap-2">
                    {form.formState.errors.targetText ? form.formState.errors.targetText.message : null }
                    {form.formState.errors.language ? form.formState.errors.language.message : null }
                    <TextAreaWatched control={form.control}></TextAreaWatched>
                </div>
                <Button className="rounded-lg py-0" variant={'ghost'} type="submit" disabled={isLoading}>Translate</Button>
                </div>
                </div>
            </form>
        </Form>
        
        </div>
    )
}