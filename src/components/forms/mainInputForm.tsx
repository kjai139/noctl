"use client"
import { Control, useForm, useWatch } from "react-hook-form";
import { Textarea } from "../ui/textarea";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { Button } from "../ui/button";
import { translateGemini, translateGpt, translateClaude } from "@/app/action";
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
    const { setGlossary, slot1ModelName, slot1ResultDisplay, setSlot1ResultDisplay, glossary, isLoading, setIsLoading, chunks, setChunks, setSlot2ResultDisplay, slot2ResultDisplay, slot2Txt, setSlot2Txt, slot1Raw, setSlot1Raw, setSlot1Txt, slot1Txt, setUserCurrency, setStandardResultError, setBetter1Error, setSlot1ModelName, setSlot2ModelName, setSlot1Error, setSlot2Error, userCurrency } = useWorkState()
    const { outputLang } = useOutputContext()
    const [selectedChunk, setSelectedChunk] = useState<number | null>(null)

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


            console.log('[Api Lookup] Non filtered Glossary:', glossary)
            console.log('[Api Lookup] Filtered Glossary:', filteredGlossary)

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
            const startTime = Date.now()
            //Standard Model
            if (model === 'standard') {
                setIsLoading(true)
                try {
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
                    const response = JSON.parse(pollResponse.job.response)
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
                    /* console.error(err, typeof err) */
                    if (err instanceof Error) {
                        throw new Error(err.message)
                    } else {
                        throw new Error('[Standard Model] Encountered a server error. If problem persists, try again later.')
                    }
                }



            } else if (model === 'b1') {

                if (userCurrency && userCurrency < claudeCost) {
                    throw new Error('You do not have enough currency to use this model. Please purchase more at the currency tab.')

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
                    console.log('[Standard Model] JobId:', jobId)
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
                        throw new Error(`You do not have enough currency. (${userCurrency} / ${openAiCost}).`)
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
                    const result = JSON.parse(pollResponse.job.response)

                    if (result) {

                        const textResult = result.text
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

            } else if (model === 'sb1') {
                setSlot1ModelName('Free')
                setSlot2ModelName('Better-1')

                if (userCurrency && userCurrency < claudeCost) {
                    throw new Error(`You do not have enough currency. ${userCurrency} / ${claudeCost}`)

                }
                setIsLoading(true)
                const [jobOneId, jobTwoId]: [any, any] = await Promise.allSettled([
                    translateGemini(params),
                    translateClaude(params)

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
                            const textResult = jobOneResponse[0].translation
                            if (jobTwoResult.status !== 'fulfilled') {

                                const glossaryResult = jobOneResponse[0].glossary

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
                            setSlot1ResultDisplay(textResult)
                            setSlot1Txt(textResult)
                        }



                    } else {
                        console.log('[jobOne] status reejected. Reason: ', jobOneResult.reason)
                        setSlot1Error(jobOneResult.reason)
                    }



                }


            } else if (model === 'sb2') {
                setSlot1ModelName('Free')
                setSlot2ModelName('Better-2')

                if (userCurrency && userCurrency < openAiCost) {
                    throw new Error(`You do not have enough currency. ${userCurrency} / ${openAiCost}`)
                }
                setIsLoading(true)

                const [jobOneId, jobTwoId]: [any, any] = await Promise.allSettled([
                    translateGemini(params),
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

                            const textResult = jobTwoResponse.text
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
                        const jobOneResponse = JSON.parse(jobOneResult.value.job.response)
                        console.log('[Sb2] jobOneResponse', jobOneResponse)
                        const textResult = jobOneResponse[0].translation
                        if (jobTwoResult.status !== 'fulfilled') {



                            const glossaryResult = jobOneResponse[0].glossary


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
                        setSlot1ResultDisplay(textResult)
                        setSlot1Txt(textResult)


                    } else {
                        console.log('[jobOne] status reejected. Reason: ', jobOneResult.reason)
                        setSlot1Error(jobOneResult.reason)
                    }



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
                        const jobTwoResponse = JSON.parse(jobTwoResult.value.job.response)
                        console.log('[Sb2] job2Response', jobTwoResponse)

                        const textResult = jobTwoResponse.text
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


                    } else {
                        console.log('[jobTwo] status reejected. Reason: ', jobTwoResult.reason)
                        setSlot2Error(jobTwoResult.reason)
                    }

                    if (jobOneResult.status === 'fulfilled') {

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




                    } else {
                        console.log('[jobTwo] status reejected. Reason: ', jobOneResult.reason)
                        setSlot2Error(jobOneResult.reason)
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
                <form onSubmit={form.handleSubmit(onSubmitTest)} className="flex gap-4 flex-col w-full flex-1 max-w-[680px]">
                    <div className="flex gap-4 mx-2">


                        {/* cara */}
                        <ChunkCarousel isDisabled={isLoading} setTextArea={setTxtareaContent} selectedChunk={selectedChunk} setSelectedChunk={setSelectedChunk}></ChunkCarousel>

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
                                        }} placeholder="Enter or paste your text here..." {...field} className="max-h-[300px] w-full border-none shadow-none resize-none main-ta focus-visible:ring-0" disabled={isLoading}>

                                        </Textarea>

                                    </FormControl>


                                </FormItem>
                            )}
                        >

                        </FormField>
                        <div className="justify-end flex gap-2 items-center p-2 pb-1">
                            <AiModelSelect setModel={setAiModel} isDisabled={isLoading}></AiModelSelect>
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