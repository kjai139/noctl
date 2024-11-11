"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Select, SelectValue, SelectTrigger, SelectContent, SelectItem } from "../ui/select";
import { Button } from "../ui/button";
import { translateGemini, translateGpt, translateTxt, translateTxtNoTool } from "@/app/action";
import { useWorkState } from "@/app/_contexts/workStateContext";
import GlossaryTable from "../tables/glossaryTable";
import { useEffect, useState } from "react";
import { GlossaryItem, GlossaryType, ModelsType } from "@/app/_types/glossaryType";
import ChunkCarousel from "../carousels/chunkCarousel";
import AiModelSelect from "../select/aiModelSelect";
import { FaArrowRightArrowLeft } from "react-icons/fa6";
import ErrorResultAlert from "../dialog/errorResult";
import Anthropic from "@anthropic-ai/sdk";
import { claudeCost, openAiCost } from "@/lib/modelPrice";
import { useOutputContext } from "@/app/_contexts/outputContext";


const tokenLimit = 10000
const textLimit = 2000




const formSchema = z.object({
    /* language: z.string({
        message: 'Please choose a language'
    }).refine(value => languageChoices.includes(value), {
        message: 'Please choose a language'
    }), */
    targetText: z.string().max(tokenLimit, {
        message: `Cannot exceed limit of ${tokenLimit} chars.`
    })
})

function TextAreaWatched({ control }: { control: Control<z.infer<typeof formSchema>> }) {
    const textarea = useWatch({
        control,
        name: 'targetText',
        defaultValue: ''
    })

    return <p>{textarea.length} / {tokenLimit}</p>
}

export default function MainInputForm() {
    // curResult = Standard
    const { setGlossary, slot1ResultDisplay, setSlot1ResultDisplay, glossary, setUnsure, isLoading, setIsLoading, chunks, setChunks, setSlot2ResultDisplay, slot2ResultDisplay, slot2Txt, setSlot2Txt, slot1Raw, setSlot1Raw, setSlot1Txt, slot1Txt, setUserCurrency, setStandardResultError, setBetter1Error, setSlot1ModelName, setSlot2ModelName, setSlot1Error, setSlot2Error } = useWorkState()
    const { outputLang } = useOutputContext()
    const [selectedChunk, setSelectedChunk] = useState<number | null>(null)

    const [isSplitDone, setIsSplitDone] = useState(false)
    const [aiModel, setAiModel] = useState<ModelsType>('standard')
    const [errorMsg, setErrorMsg] = useState('')


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        /* defaultValues: {
            language: 'English'
        } */
    })

    const onSubmitTest = async (values: z.infer<typeof formSchema>) => {
        if (values.targetText.length > textLimit) {
            console.log(`Text too long. ${values.targetText.length} / ${textLimit} Splitting...`)

            const firstPage = splitTextIntoChunks(values.targetText)
            console.log('first page:', firstPage)
            apiLookUp({
                text: firstPage,
                language: outputLang,
                model: aiModel
            })


        } else {
            apiLookUp({
                text: values.targetText,
                language: outputLang,
                model: aiModel
            })
        }



    }

    const setTxtareaContent = (content: string) => {
        form.setValue('targetText', content)
    }

    interface apiLookUpProps {
        text: string,
        language: string,
        model: ModelsType
    }



    const apiLookUp = async ({ text, language, model }: apiLookUpProps) => {
        setSlot1Raw(text)
        setSlot1ModelName('')
        setSlot2ModelName('')
        setSlot1ResultDisplay('')
        setSlot2ResultDisplay('')
        setSlot2Txt('')
        setSlot1Txt('')
        setSlot1Error('')
        setSlot2Error('')
        setBetter1Error('')
        setStandardResultError('')
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
                    filteredGlossary = normalizedGlossary.filter((entry: GlossaryItem) => normalizedtext.includes(entry.term))
                }


            }


            console.log('Non filtered Glossary:', glossary)
            console.log('Filtered Glossary:', filteredGlossary)

            const params = {
                text: text,
                language: language,
                ...(glossary.length > 0 && { glossary: JSON.stringify(filteredGlossary) })
            }
            console.log('Params used:', params)

            if (model === 'standard') {
                try {
                    setSlot1ModelName('Standard')
                    const result = await translateGemini(params)
                    console.log(result)
                    if (!result) {
                        throw new Error('[Standard Model Response] response blank')
                    }
                    const jsonResult = JSON.parse(result)
                    console.log(jsonResult)
                    if (jsonResult[0].glossary?.terms) {
                        const glossaryResult = jsonResult[0].glossary.terms

                        if (normalizedGlossary && normalizedGlossary.length > 0) {
                            console.log('Normalized Glossary used')
                            const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                            glossaryResult.forEach((newentry: GlossaryItem) => {
                                if (!termSet.has(newentry.term.toLowerCase())) {
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
                    }

                    if (!jsonResult[0].translation && text) {
                        setSlot1ResultDisplay(text)
                        setSlot1Txt(text)
                    } else {
                        setSlot1ResultDisplay(jsonResult[0].translation)
                        setSlot1Txt(jsonResult[0].translation)
                    }




                } catch (err: any) {
                    console.log('Error in Standard API')
                    /* console.error(err, typeof err) */
                    if (err instanceof Error) {
                        throw new Error(err.message)
                    } else {
                        throw new Error('[Standard Model] Encountered a server error. If problem persists, try again later.')
                    }
                }



            } else if (model === 'b1') {
                setSlot1ModelName('Better-1')
                const result: any = await translateTxt(params)
                console.log('Api response:', result)
                try {
                    if (result && result[0]) {
                        if (result[0].type === 'tool_use') {
                            const textResult = result[0].input.text
                            const glossaryResult = result[0].input.glossary
    
                            //add new entries if not dupe - backend should only return normalized results
                            if (normalizedGlossary && normalizedGlossary.length > 0) {
                                console.log('Normalized Glossary used')
                                const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                                glossaryResult.forEach((newentry: GlossaryItem) => {
                                    /* let normalizedterm = newentry.term.toLowerCase() */
                                    if (!termSet.has(newentry.term.toLowerCase())) {
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
    
    
    
    
                            setSlot2ResultDisplay(textResult)
                            setSlot2Txt(textResult)
                            setUserCurrency((prev) => {
                                if (prev !== null && prev !== undefined) {
                                    return prev - claudeCost
                                }
                                return prev
                            })
    
    
                        }
    
                    }
                } catch (err:any) {
                    console.error(err)
                    if (err instanceof Error) {
                        throw err
                    } else {
                        throw new Error('[Better-1] An unknown error has occured, Please try again later')
                    }
                }
                
            } else if (model === 'sb1') {
                setSlot1ModelName('Standard')
                setSlot2ModelName('Better-1')
                
                const [result1, result2]: [any, any] = await Promise.allSettled([
                    translateTxt(params),
                    translateGemini(params)
                ])
                //claude
                if (result1.status === 'fulfilled') {
                    const result1Response = result1.value[0]
                    if (result1Response.type === 'tool_use') {
                        const textResult = result1Response.input.text
                        const glossaryResult = result1Response.input.glossary

                        if (normalizedGlossary && normalizedGlossary.length > 0) {
                            console.log('Normalized Glossary used')
                            const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                            glossaryResult.forEach((newentry: GlossaryItem) => {
                                if (!termSet.has(newentry.term.toLowerCase())) {
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





                        setSlot2ResultDisplay(textResult)

                        setSlot2Txt(textResult)
                        setUserCurrency((prev) => {
                            if (prev !== null && prev !== undefined) {
                                return prev - claudeCost
                            }
                            return prev
                        })

                    }
                } else {
                    console.log('Result1', result1)
                    setSlot2Error(result1.reason.message)

                }
                // gemini
                if (result2.status === 'fulfilled') {
                    console.log('result2', result2)
                    const jsonResult2 = JSON.parse(result2.value)
                    console.log(jsonResult2)
                    setSlot1ResultDisplay(jsonResult2[0].translation)
                    setSlot1Txt(jsonResult2[0].translation)
                } else {
                    console.log('Result2', result2)
                    setSlot1Error(result2.reason.message)

                }
                
                
            } else if (model === 'b2') {
                setSlot1ModelName('Better-2')
                try {
                    const result = await translateGpt(params)
                    console.log('[translateGpt] ', result)

                    if (result) {

                        const textResult = result.text
                        const glossaryResult = result.glossary

                        //add new entries if not dupe - backend should only return normalized results
                        if (normalizedGlossary && normalizedGlossary.length > 0) {
                            console.log('Normalized Glossary used')
                            const termSet = new Set(normalizedGlossary.map(entry => entry.term))
                            glossaryResult.forEach((newentry: GlossaryItem) => {
                                /* let normalizedterm = newentry.term.toLowerCase() */
                                if (!termSet.has(newentry.term.toLowerCase())) {
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




                        setSlot2ResultDisplay(textResult)
                        setSlot2Txt(textResult)
                        setUserCurrency((prev) => {
                            if (prev !== null && prev !== undefined) {
                                return prev - openAiCost
                            }
                            return prev
                        })




                    }


                } catch (err) {
                    console.error('[translateGpt] Error', err)
                    if (err instanceof Error) {
                        throw new Error(`[Better-2] ${err.message}`)
                    }
                }

            }

            setIsLoading(false)
        } catch (err: any) {
            console.error(err, typeof err)
            if (err.message) {
                setErrorMsg(err.message)
            } else {
                setErrorMsg('Encountered an unknown server error. If problem persists, try again later')
            }

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

    const splitTextIntoChunks = (text: string) => {
        setChunks([])
        const splitTxtLimit = textLimit - 100
        let currentChunk = ''
        let chunks: string[] = []
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




    const setSlot1ResultDisplayHandle = () => {
        const text = `test text`
        setSlot1ResultDisplay(text)
    }



    return (

        <div className="flex gap-8 justify-center items-center my-8">
            {
                errorMsg ?
                    <ErrorResultAlert errorMsg={errorMsg} setErrorMsg={setErrorMsg}></ErrorResultAlert>
                    : null

            }


            {/* <Button onClick={setSlot1ResultDisplayHandle}>Test output</Button> */}
            {/* <GlossaryTable glossary={glossary} setGlossary={setGlossary}></GlossaryTable> */}

            {/* <div className="justify-center items-center flex">
                    <FaArrowRightArrowLeft size={24}></FaArrowRightArrowLeft>
                </div> */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmitTest)} className="flex gap-4 flex-col w-full sm:w-auto">
                    <div className="flex gap-4 mx-2">


                        {/* cara */}
                        <ChunkCarousel setTextArea={setTxtareaContent} selectedChunk={selectedChunk} setSelectedChunk={setSelectedChunk}></ChunkCarousel>

                    </div>
                    <div className="flex flex-col gap-4 main-wrap border-4 border-transparent rounded-xl">
                        <FormField control={form.control}
                            name="targetText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <Textarea maxLength={13000} onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement
                                            target.style.height = 'auto';
                                            target.style.height = `${target.scrollHeight}px`;
                                        }} placeholder="Enter text..." {...field} className="sm:min-w-[600px] max-h-[300px] lg:min-w-[700px] border-none shadow-none resize-none main-ta focus-visible:ring-0" disabled={isLoading}>

                                        </Textarea>

                                    </FormControl>


                                </FormItem>
                            )}
                        >

                        </FormField>
                        <div className="justify-end flex gap-2 items-center p-2 pb-1">
                            <AiModelSelect setModel={setAiModel}></AiModelSelect>
                            <div className="text-destructive p-0 flex gap-2 items-center">
                                {form.formState.errors.targetText ? <span className="text-sm">{form.formState.errors.targetText.message}</span> : null}
                                {/* {form.formState.errors.language ? form.formState.errors.language.message : null} */}
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