"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { translateGemini, translateGpt, translateClaude, testGemini } from "@/app/action";
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
import { useSession } from "next-auth/react";
import redis from "@/lib/redis";
import { pollJobStatus } from "@/app/_utils/pollJobStatus";
import { jsonrepair } from 'jsonrepair'
import { useEditTabContext } from "@/app/_contexts/editContext";
import useButtonDisabled from "@/hooks/use-disabled";
import MainTextArea from "../textarea/mainTextarea";
import OutputSelect from "../select/outputSelect";


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

    return <p className="whitespace-nowrap">{textarea.length} / {tokenLimit}</p>
}

export default function MainInputForm() {
    // curResult = Standard
    const { setGlossary, slot1ModelName, slot1ResultDisplay, setSlot1ResultDisplay, glossary, isLoading, setIsLoading, chunks, setChunks, setSlot2ResultDisplay, slot2ResultDisplay, slot2Txt, setSlot2Txt, slot1Raw, setSlot1Raw, setSlot1Txt, slot1Txt, setUserCurrency, setStandardResultError, setBetter1Error, setSlot1ModelName, setSlot2ModelName, setSlot1Error, setSlot2Error, userCurrency, setIsSlot1RawOn, setIsSlot2RawOn } = useWorkState()
    const { outputLang } = useOutputContext()
    const { setIsSlot1EditShowing, setIsSlot2EditShowing, setSlot1EditedTxt, setSlot2EditedTxt} = useEditTabContext()
    const [selectedChunk, setSelectedChunk] = useState<number | null>(null)
    const isDisabled = useButtonDisabled()

    const [isSplitDone, setIsSplitDone] = useState(false)
    const [aiModel, setAiModel] = useState<ModelsType>('standard')
    const [errorMsg, setErrorMsg] = useState('')
    const [isFetching, setIsFetching] = useState(false)
    const { data: session } = useSession()


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        /* defaultValues: {
            language: 'English'
        } */
    })

    const onSubmitTest = async (values: z.infer<typeof formSchema>) => {
        if (!session || !session.user.id) {
            console.log('[onSubmit] User is not logged in - ', session)
            setErrorMsg('Please sign in to use the models.')
            return
        }
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
        setIsSlot1RawOn(false)
        setIsSlot2RawOn(false)
        setSlot1EditedTxt('')
        setSlot2EditedTxt('')
        setIsSlot1EditShowing(false)
        setIsSlot2EditShowing(false)

        try {
            if (!navigator.onLine) {
                throw new Error('You are offline. Please check your connection and try again.')
            }
            let normalizedGlossary
            let filteredGlossary
            /* filterGlossary only consists of words from the glossary that exists in the query text */
            const normalizedtext = text.toLowerCase()
                .replace(/[(){}\[\]<>]/g, ' ')
                .replace(/[!"#$%&'*+,\-./:;<=>?@[\]^_`{|}~]/g, '')
            
            console.log('[Normalized Text]', normalizedtext)

            const normalizedTxtWithBrackets = text.toLowerCase()
            .replace(/[{}<>]/g, ' ') // Removes only curly braces and angle brackets
            .replace(/[!"#$%&'*+,\-./:;=?@^_`{|}~]/g, ''); // Keeps [], ()

            console.log('[normalizedTxtWithBrackets]', normalizedTxtWithBrackets)

            if (glossary.length > 0) {
                console.log('[ApiLookup] Glossary detected :', glossary)
                normalizedGlossary = glossary.map((entry) => {
                    return (
                        {
                            ...entry,
                            term: entry.term.toLowerCase(),
                        }
                    )
                })

                if (normalizedGlossary) {
                    filteredGlossary = normalizedGlossary.filter((entry: GlossaryItem) => normalizedtext.includes(entry.term) || normalizedTxtWithBrackets.includes(entry.term))
                    console.log('[Api Lookup] Filtered Glossary:', filteredGlossary)
                }
            } else {
                console.log('[ApiLookup] No glossary used.')
            }


            

            const params = {
                text: text,
                language: language,
                ...(glossary.length > 0 && { glossary: JSON.stringify(filteredGlossary) })
            }
            console.log('[Api Lookup] Params used:', params)

            const txtLength = text.length
            
            let pollInterval = 5000
            // 1sec is 1k
            if (txtLength < 150) {
                pollInterval = 5000
            } else if (txtLength > 150 && txtLength < 500) {
                pollInterval = 10000
            } else if (txtLength > 500 && txtLength < 1000) {
                pollInterval = 20000
            } else if (txtLength > 1000) {
                pollInterval = 30000
            }
            console.log('[Apilookup] Text length:', txtLength)
            console.log('[Apilookup] Polling Interval:', pollInterval, 'ms')
            const startTime = Date.now()
            //Standard Model
            if (model === 'standard') {
                setIsLoading(true)
                try {
                    setSlot1ModelName('Free')

                    const jobId = await translateGemini(params)
                    console.log('[Standard Model] Job Id - ', jobId)
                    if (!jobId) {
                        throw new Error('[Standard Model] Missing job Id')
                    }
                    console.log('[Standard Model] JobId:', jobId)
                    const pollResponse = await pollJobStatus({
                        jobId: jobId,
                        startTime: startTime,
                        interval: pollInterval,
                    })

                    if (pollResponse.job.jobStatus === 'failed') {
                        if (typeof pollResponse.job.response === 'string') {
                            throw new Error(pollResponse.job.response)
                        } else {
                            throw new Error('Something went wrong *_*. Please try again later.')
                        }
                 
                    }
                    let jsonResponse
                    try {
                        
                        jsonResponse = JSON.parse(pollResponse.job.response)
                        if (/^```|```$/.test(pollResponse.job.response)) {
                            console.log("[Standard Model] *** String has triple backticks at the start or end")
                            try {
                                jsonResponse = jsonrepair(jsonResponse)
                                console.log('new JSON RESPONSE', jsonResponse)
                            } catch (err) {
                                throw new Error('AI returned corrupted data. This is a rare bug that sometimes happen with this model if the last line of text is a dialog with single quotes.')
                            }
                            
                        }
                        const glossaryResult = jsonResponse.dictionary

                        if (normalizedGlossary && normalizedGlossary.length > 0) {
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

                        if (jsonResponse?.lines?.length > 0) {
                            const resultTxt = jsonResponse.lines.join('\n')
                            setSlot1ResultDisplay(resultTxt)
                            setSlot1Txt(resultTxt)
                        }
                        setIsLoading(false)

                    } catch (err) {
                        setIsLoading(false)
                        console.error('[Standard Model] Invalid response', err)
                        throw new Error('Invalid response. Please try again later.')
                        
                    }
                  
                   

                } catch (err) {
                    console.error(err)
                    throw err
                }
                /* setIsLoading(true) */
                /* try {
                    setSlot1ModelName('Free')
                    const jobId = await translateGemini(params)
                    // const jobId = `testJobId`
                    console.log('[Standard Model] Job Id - ', jobId)
                    if (!jobId) {
                        throw new Error('[Standard Model] Missing job Id')
                    }
                    console.log('[Standard Model] JobId:', jobId)
                    const pollResponse = await pollJobStatus({
                        jobId: jobId,
                        startTime: startTime,
                        interval: pollInterval,
                    })
                    

                    console.log(`[Standard Model] pollResponse for id ${jobId}`, pollResponse)
                    if (pollResponse.job.jobStatus === 'failed') {
                       
                        if (typeof pollResponse.job.response === 'string') {
                            throw new Error(pollResponse.job.response)
                        } else {
                            throw new Error('Something went wrong *_*. Please try again later.')
                        }
                       

                        
                    }
                    let jsonResponse = pollResponse.job.response
                    if (/^```|```$/.test(pollResponse.job.response)) {
                        console.log("String has triple backticks at the start or end")
                        try {
                            jsonResponse = jsonrepair(jsonResponse)
                            console.log('new JSON RESPONSE', jsonResponse)
                        } catch (err) {
                            throw new Error('AI returned corrupted data. This is a rare bug that seems to happen with this model if the last line of text is a dialog with single quotes.')
                        }
                        
                    }
                    const response = JSON.parse(jsonResponse)
                    console.log(response)
                    if (response[0].glossary?.terms) {
                        const glossaryResult = response[0].glossary.terms

                        //normalized glossary is user's glossary
                        if (normalizedGlossary && normalizedGlossary.length > 0) {
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

                    if (!response[0].translation && text) {
                        setSlot1ResultDisplay(text)
                        setSlot1Txt(text)
                    } else {
                        setSlot1ResultDisplay(response[0].translation)
                        setSlot1Txt(response[0].translation)
                    }




                } catch (err: any) {
                    console.log('Error in Standard API')
                    
                    if (err instanceof Error) {
                        throw new Error(err.message)
                    } else {
                        throw new Error('[Standard Model] Encountered a server error. If problem persists, try again later.')
                    }
                } */



            } else if (model === 'b1') {

                if (userCurrency && userCurrency < claudeCost) {
                    throw new Error(`You do not have enough currency to use this model (${userCurrency} / ${claudeCost}). You can purchase more at the currency tab.`)

                }
                setIsLoading(true)

                try {
                    setSlot1ModelName('Better-1')
                    const jobId = await translateClaude(params)
                    console.log('[B1 Model] Job Id - ', jobId)
                    if (!jobId) {
                        console.error('[B-1] Missing job Id')
                        throw new Error('Something went wrong -_-, please try again later.')
                    }
                    console.log('[B1 Model] JobId:', jobId)
                    const pollResponse = await pollJobStatus({
                        jobId: jobId,
                        startTime: startTime,
                        interval: pollInterval,
                    })
                    const result = JSON.parse(pollResponse.job.response)
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


                            setSlot1ResultDisplay(textResult)
                            setSlot1Txt(textResult)
                            setUserCurrency((prev) => {
                                if (prev !== null && prev !== undefined) {
                                    return prev - claudeCost
                                }
                                return prev
                            })


                        }

                    }
                } catch (err: any) {
                    console.error(err)
                    if (err instanceof Error) {
                        throw err
                    } else {
                        console.error('[B1] Unhandled error occured :', err)
                        throw new Error('Something went wrong -_-, please try again later.')
                    }
                }

            } else if (model === 'b2') {
                setSlot1ModelName('Better-2')
                console.log('user cur', userCurrency, openAiCost)

                try {
                    if (userCurrency !== undefined && userCurrency !== null && userCurrency < openAiCost) {
                        console.log(openAiCost > userCurrency)
                        throw new Error(`You do not have enough currency. (${userCurrency} / ${openAiCost}). You can purchase more at the currency tab.`)
                    }

                    setIsLoading(true)
                    const jobId = await translateGpt(params)
                    if (!jobId) {
                        throw new Error('[Standard Model] Missing job Id')
                    }
                    console.log('[b2 Model] JobId:', jobId)
                    const pollResponse = await pollJobStatus({
                        jobId: jobId,
                        startTime: startTime,
                        interval: pollInterval,
                    })
                    if (pollResponse.jobStatus === 'failed') {
                        const errorMsg = pollResponse.job.response
                        throw new Error(`${errorMsg || 'Something went wrong, please try again later.'}`)
                    }
                    const result = JSON.parse(pollResponse.job.response)

                    if (result) {
                        console.log('[b2] Result:', result)
                        const textResult = result.lines.map((item:any) => item.translated_line).join('\n')
                        const glossaryResult = result.glossary

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




                        setSlot1ResultDisplay(textResult)
                        setSlot1Txt(textResult)
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

            } else if (model === 'sb1') {
                setSlot1ModelName('Free')
                setSlot2ModelName('Better-1')

                if (userCurrency && userCurrency < claudeCost) {
                    throw new Error(`You do not have enough currency. ${userCurrency} / ${claudeCost}`)

                }
                setIsLoading(true)

                const jobOneId = await translateGemini(params)
                const jobTwoId = await translateClaude(params)
                
                
                const [jobOneResult, jobTwoResult] = await Promise.allSettled([
                    pollJobStatus({
                        jobId: jobOneId,
                        startTime: startTime,
                        interval: pollInterval,
                    }),
                    pollJobStatus({
                        jobId: jobTwoId,
                        startTime: startTime,
                        interval: pollInterval,
                    })

                ])

                if (jobTwoResult.status === 'fulfilled') {
                    if (jobTwoResult.value.jobStatus === 'failed') {
                        const jobErrorMsg = jobTwoResult.value.job.response
                        setSlot2Error(jobErrorMsg)
                    } else if (jobTwoResult.value.jobStatus === 'completed') {
                        const result = JSON.parse(jobTwoResult.value.job.response)
                        if (result && result[0]) {
                            if (result[0].type === 'tool_use') {
                                const textResult = result[0].input.text
                                const glossaryResult = result[0].input.glossary


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

                        }
                    }




                } else {
                    console.log('[jobTwo] status reejected. Reason: ', jobTwoResult.reason)
                    setSlot2Error(jobTwoResult.reason)
                }

                if (jobOneResult.status === 'fulfilled') {
                    
                    if (jobOneResult.value.jobStatus === 'failed') {
                        const jobErrorMsg = jobOneResult.value.job.response
                        console.log('[jobOne] job status failed. Reason: ', jobErrorMsg)
                        setSlot1Error(jobErrorMsg)
                    } else if (jobOneResult.value.jobStatus === 'completed') {
                        const jobOneResponse = JSON.parse(jobOneResult.value.job.response)
                        console.log('[Sb1] jobOneResponse', jobOneResponse)
                        console.log('[Sb1] jobOne Glossary', jobOneResponse.glossary)
                        const textArr= jobOneResponse.lines

                        
                        if (jobTwoResult.status !== 'fulfilled') {

                            const glossaryResult = jobOneResponse.dictionary

                            if (normalizedGlossary && normalizedGlossary.length > 0) {
                                console.log('jobOne glossary used')
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
                        if (textArr && textArr.length > 0) {
                            const textResult = textArr.join('\n')
                            setSlot1ResultDisplay(textResult)
                            setSlot1Txt(textResult)
                        }
                       
                    }



                } else {
                    console.log('[jobOne] status reejected. Reason: ', jobOneResult.reason)
                    setSlot1Error(jobOneResult.reason)
                }


            } else if (model === 'sb2') {
                //need test
                setSlot1ModelName('Free')
                setSlot2ModelName('Better-2')

                if (userCurrency && userCurrency < openAiCost) {
                    throw new Error(`You do not have enough currency. ${userCurrency} / ${openAiCost}`)
                }
                setIsLoading(true)

                const jobOneId = await translateGemini(params)
                const jobTwoId = await translateGpt(params)


                const [jobOneResult, jobTwoResult] = await Promise.allSettled([
                    pollJobStatus({
                        jobId: jobOneId,
                        startTime: startTime,
                        interval: pollInterval,
                    }),
                    pollJobStatus({
                        jobId: jobTwoId,
                        startTime: startTime,
                        interval: pollInterval,
                    })

                ])

                if (jobTwoResult.status === 'fulfilled') {
                    if (jobTwoResult.value.jobStatus === 'failed') {
                        const jobErrorMsg = jobTwoResult.value.job.response
                        setSlot2Error(jobErrorMsg)
                    } else if (jobTwoResult.value.jobStatus === 'completed') {
                        const jobTwoResponse = JSON.parse(jobTwoResult.value.job.response)
                        console.log('[Sb2] job2Response', jobTwoResponse)
                        
                        const textResult = jobTwoResponse.lines.map((item:any) => item.translated_line).join('\n')
                        const glossaryResult = jobTwoResponse.glossary


                        if (normalizedGlossary && normalizedGlossary.length > 0) {
                            console.log('jobTwo glossary used')
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
                                return prev - openAiCost
                            }
                            return prev
                        })
                    }



                } else {
                    console.log('[jobTwo] jobTwo failed. Reason: ', jobTwoResult.reason)
                    setSlot2Error(jobTwoResult.reason)
                }

                if (jobOneResult.status === 'fulfilled') {
                    if (jobOneResult.value.jobStatus === 'failed') {
                        const jobErrorMsg = jobOneResult.value.job.response
                        setSlot1Error(jobErrorMsg)
                    } else if (jobOneResult.value.jobStatus === 'completed') {
                        const jobOneResponse = JSON.parse(jobOneResult.value.job.response)
                        console.log('[Sb2] jobOneResponse', jobOneResponse)
                        console.log('[Sb2] jobOne Glossary', jobOneResponse.glossary)
                        const textArr= jobOneResponse.lines

                        if (jobTwoResult.status !== 'fulfilled') {

                            const glossaryResult = jobOneResponse.dictionary
                            if (normalizedGlossary && normalizedGlossary.length > 0) {
                                console.log('jobOne glossary used')
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

                        if (textArr && textArr.length > 0) {
                            const textResult = textArr.join('\n')
                            setSlot1ResultDisplay(textResult)
                            setSlot1Txt(textResult)
                        }
                        
                    }



                } else {
                    console.log('[jobOne] status reejected. Reason: ', jobOneResult.reason)
                    setSlot1Error(jobOneResult.reason)
                }


               





            } else if (model === 'b12') {

                const totalCost = openAiCost + claudeCost
                if (userCurrency && userCurrency < totalCost) {
                    setErrorMsg(`You do not have enough currency. ${userCurrency} / ${totalCost}`)
                }
                setIsLoading(true)
                setSlot1ModelName('Better-1')
                setSlot2ModelName('Better-2')
                const [jobOneId, jobTwoId]: [any, any] = await Promise.allSettled([
                    translateClaude(params),
                    translateGpt(params)

                ])

                if (jobOneId.status !== 'fulfilled' || jobTwoId.status !== 'fulfilled') {
                    throw new Error('Encountered a server error. Please try again later.')

                } else {
                    const [jobOneResult, jobTwoResult] = await Promise.allSettled([
                        pollJobStatus({
                            jobId: jobOneId.value,
                            startTime: startTime,
                            interval: pollInterval,
                        }),
                        pollJobStatus({
                            jobId: jobTwoId.value,
                            startTime: startTime,
                            interval: pollInterval,
                        })

                    ])

                    if (jobTwoResult.status === 'fulfilled') {
                        if (jobTwoResult.value.jobStatus === 'failed') {
                            const jobErrorMsg = jobTwoResult.value.job.response
                            setSlot2Error(jobErrorMsg)
                        } else if (jobTwoResult.value.jobStatus === 'completed') {
                            const jobTwoResponse = JSON.parse(jobTwoResult.value.job.response)
                            console.log('[Sb2] job2Response', jobTwoResponse)

                            const textResult = jobTwoResponse.lines.map((item:any) => item.translated_line).join('\n')
                            const glossaryResult = jobTwoResponse.glossary


                            if (normalizedGlossary && normalizedGlossary.length > 0) {
                                console.log('jobTwo glossary used')
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
                                    return prev - openAiCost
                                }
                                return prev
                            })
                        }



                    } else {
                        console.log('[jobTwo] status reejected. Reason: ', jobTwoResult.reason)
                        setSlot2Error(jobTwoResult.reason)
                    }

                    if (jobOneResult.status === 'fulfilled') {
                        if (jobOneResult.value.jobStatus === 'failed') {
                            const jobErrorMsg = jobOneResult.value.job.response
                            setSlot1Error(jobErrorMsg)
                        } else if (jobOneResult.value.jobStatus === 'completed') {
                            const result = JSON.parse(jobOneResult.value.job.response)
                            console.log('[b12] jobOneResponse', result)
                            if (result && result[0]) {
                                if (result[0].type === 'tool_use') {
                                    const textResult = result[0].input.text
                                    const glossaryResult = result[0].input.glossary

                                    if (jobTwoResult.status !== 'fulfilled') {
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




                                    setSlot1ResultDisplay(textResult)
                                    setSlot1Txt(textResult)
                                    setUserCurrency((prev) => {
                                        if (prev !== null && prev !== undefined) {
                                            return prev - claudeCost
                                        }
                                        return prev
                                    })


                                }
                            }
                        }





                    } else {
                        console.log('[jobOne] status reejected. Reason: ', jobOneResult.reason)
                        setSlot1Error(jobOneResult.reason)
                    }
                }




            }

            setIsLoading(false)
        } catch (err: any) {
            console.error(err)

            if (err.message) {
                if (err.message === 'Failed to fetch') {
                    setErrorMsg('Network Error. The server might be unreachable or your internet connection may be unstable.')
                } else {
                    setErrorMsg(err.message)
                }

            } else {
                setErrorMsg('Encountered an unknown server error. If problem persists, try again later.')
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

        <div className="flex gap-8 justify-center items-center">
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
                <form onSubmit={form.handleSubmit(onSubmitTest)} className="flex gap-4 flex-col w-full flex-1 max-w-[680px]">
                    <div className="flex gap-4 mx-2">


                        {/* cara */}
                        <ChunkCarousel isDisabled={isDisabled} setTextArea={setTxtareaContent} selectedChunk={selectedChunk} setSelectedChunk={setSelectedChunk}></ChunkCarousel>

                    </div>
                    <div className="flex flex-col gap-4 main-wrap border-4 border-transparent rounded-xl">
                        <FormField control={form.control}
                            name="targetText"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        {/* <Textarea maxLength={13000} onInput={(e) => {
                                            const target = e.target as HTMLTextAreaElement
                                            target.style.height = 'auto';
                                            target.style.height = `${target.scrollHeight}px`;
                                        }} placeholder="Enter or paste your text here..." {...field} className="max-h-[300px] w-full border-none shadow-none resize-none main-ta focus-visible:ring-0" disabled={isDisabled}>

                                        </Textarea> */}
                                        <MainTextArea field={field} isDisabled={isDisabled}></MainTextArea>

                                    </FormControl>


                                </FormItem>
                            )}
                        >

                        </FormField>
                        <div className="justify-end flex gap-2 items-center p-2 pb-1">
                            <div className="flex gap-2 f-btn">
                            <OutputSelect isDisabled={isDisabled}></OutputSelect>
                            <AiModelSelect setModel={setAiModel} isDisabled={isDisabled}></AiModelSelect>
                            </div>
                            <div className="flex gap-2 f-btn">
                            <div className="text-destructive p-0 flex gap-2 items-center justify-center f-txt text-center">
                                {form.formState.errors.targetText ? <span className="text-sm">{form.formState.errors.targetText.message}</span> : null}
                                {/* {form.formState.errors.language ? form.formState.errors.language.message : null} */}
                                <TextAreaWatched control={form.control}></TextAreaWatched>
                            </div>
                            <Button className="rounded-lg py-0" variant={'ghost'} type="submit" disabled={isDisabled}>Translate</Button>
                            </div>
                        </div>
                    </div>
                </form>
            </Form>

        </div>

    )
}