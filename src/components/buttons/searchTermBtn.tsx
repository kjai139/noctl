'use client'
import { pollJobStatus } from "@/app/_utils/pollJobStatus"
import { TermLookup } from "@/app/action"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "@/components/ui/dialog"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import { ChangeEvent, useEffect, useRef, useState } from "react"
import { TbReportSearch } from "react-icons/tb"
import { Button } from "../ui/button"
import { Textarea } from "../ui/textarea"


interface searchTermBtnProps {
    term: string,
    language: string
}


export default function SearchTermBtn({ term, language }: searchTermBtnProps) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [result, setResult] = useState('')
    const [curTerm, setCurTerm] = useState('')
    const [curContext, setCurContext] = useState('')
    const [curInterp, setCurInterp] = useState('')
    const [aLookupError, setALookupError] = useState('')
    const [altDef, setAltDef] = useState([])
    const isMounted = useRef(true)
    const contextLimit = 240


    useEffect(() => {
        isMounted.current = isDialogOpen
    }, [isDialogOpen])

    const termLookup = async () => {
        setCurTerm(term)
        setCurInterp('')
        setCurContext('')
        setIsDialogOpen(true)
        setIsLoading(true)
        setALookupError('')
        setResult('')
        setALookupError('')
        setAltDef([])
        setErrorMsg('')
        console.log(`Looking up ${term} in ${language}`)
        try {

            const jobId = await TermLookup({
                term: term,
                language: language
            })

            console.log('[Standard Model] JobId:', jobId)
            const startTime = Date.now()
            const pollInterval = 3000
            const timeOut = 10000
            const pollResponse = await pollJobStatus({
                jobId: jobId,
                startTime: startTime,
                interval: pollInterval,
                maxTimer: timeOut,
                initialDelay: 5000
            })

            if (pollResponse.jobStatus === 'failed') {
                if (typeof pollResponse.job.response === 'string') {
                    throw new Error(pollResponse.job.response)
                } else {
                    throw new Error('Something went wrong *_*. Please try again later.')
                }

            }
            const json = JSON.parse(pollResponse.job.response)

            console.log(json)
            setIsLoading(false)
            const definition = json[0].explanation
            const interp = json[0].translation
            const altDefs = json[0].alternate_translations
            if (isMounted.current) {
                if (interp && interp !== 'null') {
                    setCurInterp(interp)
                }
                if (altDefs.length > 0) {
                    setAltDef(altDefs)
                }
                setResult(definition)
            } else {
                console.log('[SearchTerm] dialog is closed.')
            }



        } catch (err) {
            setIsLoading(false)
            console.error('Error looking up term.', err)
            if (err instanceof Error) {
                setErrorMsg(err.message)
            } else {
                setErrorMsg('Encountered a server error. Please try again later.')
            }
        }
    }

    const additionalLookup = async (context: string) => {
        if (!context.includes(curTerm.toLowerCase())) {
            setALookupError('Please include the term in your example / explanation.')
        } else {
            setALookupError('')
            setErrorMsg('')
            setIsLoading(true)
            try {

                const jobId = await TermLookup({
                    term: term,
                    language: language,
                    context: context
                })
                const startTime = Date.now()
                const pollInterval = 3000
                const timeOut = 10000
                const pollResponse = await pollJobStatus({
                    jobId: jobId,
                    startTime: startTime,
                    interval: pollInterval,
                    maxTimer: timeOut
                })

                if (pollResponse.jobStatus === 'failed') {
                    if (typeof pollResponse.job.response === 'string') {
                        throw new Error(pollResponse.job.response)
                    } else {
                        throw new Error('Something went wrong *_*. Please try again later.')
                    }

                }



                const json = JSON.parse(pollResponse.job.response)
                console.log(json)
                setIsLoading(false)
                const definition = json[0].explanation
                const interp = json[0].translation
                const altDefs = json[0].alternate_translations
                if (isMounted.current) {
                    setResult(definition)
                    setCurInterp(interp)
                    if (altDefs.length > 0) {
                        setAltDef(altDefs)
                    }
                } else {
                    console.log('[additional lookup] dialog is closed.')
                }



            } catch (err) {
                setIsLoading(false)
                console.error('Error looking up term.')
                if (err instanceof Error) {
                    setErrorMsg(err.message)
                } else {
                    setErrorMsg('Encountered a server error. Please try again later.')
                }
            }
        }

    }

    const handleContextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        setCurContext(e.target.value)
    }



    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>

                    <Button size={'sm'} variant={'ghostgloss'} onClick={() => termLookup()}>
                        <TbReportSearch size={20}></TbReportSearch>
                    </Button>

                </TooltipTrigger>
                <TooltipContent>
                    <p>Term lookup</p>
                </TooltipContent>
            </Tooltip>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>

                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="leading-normal pt-6">{curTerm} {curInterp ? `- ${curInterp}` : ''}</DialogTitle>
                        <DialogDescription>
                            <span className="text-sm text-muted-foreground flex gap-1">
                                {
                                    altDef && altDef.length > 0 ?
                                        'Alt: ' : null
                                }
                                {
                                    altDef && altDef.length > 0 && altDef.map((node: { translation: string }, idx) => {
                                        return (
                                            <span key={`altDef-${idx}`}>
                                                {`${node.translation}${(idx + 1) < altDef.length ? ',' : ''}`}
                                            </span>
                                        )
                                    })
                                }
                            </span>
                        </DialogDescription>

                    </DialogHeader>
                    {

                    }
                    <div>
                        {isLoading ?
                            <div className="flex justify-center items-center px-4 py-8">
                                <div className="searchLoader"></div>
                            </div>
                            :
                            null
                        }
                        {
                            result && !isLoading ?
                                <div>

                                    <span>
                                        {result}
                                    </span>

                                    <div className="mt-4 flex flex-col gap-4">
                                        <span className="text-destructive text-sm flex gap-2">
                                            <span>
                                                Don't think it's quite right? Provide more context.
                                            </span>
                                            <span>
                                                {`(${curContext.length} / ${contextLimit})`}
                                            </span>
                                        </span>
                                        <div className="flex gap-4 flex-col">
                                            <Textarea className="max-h-[650px]shadow-none resize-none focus-visible:ring-0" maxLength={contextLimit} value={curContext} onChange={handleContextChange} placeholder="Enter an example sentence or more context with the term included here..." onInput={(e) => {
                                                const target = e.target as HTMLTextAreaElement
                                                target.style.height = 'auto';
                                                target.style.height = `${target.scrollHeight}px`;
                                            }}></Textarea>
                                            <Button onClick={() => additionalLookup(curContext)}>
                                                Re-search
                                            </Button>
                                        </div>
                                        <span className="text-destructive font-semibold text-sm">
                                            {aLookupError && !errorMsg ? aLookupError : null}
                                        </span>
                                    </div>
                                </div>
                                : null
                        }
                        {
                            errorMsg && !isLoading ?
                                <div>
                                    <span className="text-destructive">
                                        {`${errorMsg}`}
                                    </span>
                                </div> : null
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>

    )
}