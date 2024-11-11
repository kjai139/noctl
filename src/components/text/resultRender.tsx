'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"
import { useEffect, useRef, useState } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import ResultWrap from "../wrapper/resultWrap"


export default function ResultRender() {

    const { slot1ResultDisplay, slot1Txt, setSlot1Txt, slot2Txt, setSlot2Txt, isLoading, slot2ResultDisplay, setSlot1ResultDisplay, setSlot2ResultDisplay, setSlot1Raw, slot1Raw, standardResultError, better1Error, slot1ModelName, slot2ModelName, slot1Error, slot2Error } = useWorkState()
    const [seconds, setSeconds] = useState(0)
    const intervalRef = useRef<NodeJS.Timeout | null>(null)
    const loadingRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        if (isLoading) {
            setSeconds(0)
            intervalRef.current = setInterval(() => {
                setSeconds(prev => prev + 1)
            }, 1000)
            loadingRef?.current?.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            })
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isLoading])


    return (
        <>
            {
                isLoading || slot1ResultDisplay || slot2ResultDisplay || slot1Error && slot2Error ?
                    <div className="flex items-center justify-center flex-col relative min-h-screen">

                        {isLoading ?
                            <>
                                <div className="absolute">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-end font-bold text-lg justify-between">
                                            <div className="loader" ref={loadingRef}>
                                            </div>
                                            <span>
                                                {`${seconds > 0 ? seconds : '0'}s`}
                                            </span>
                                        </div>

                                        <span className="justify-center text-muted-foreground">{`...It might take a min, please be patient.`}</span>
                                    </div>
                                </div>
                            </>
                            : null
                        }

                        {slot1ResultDisplay && !isLoading || slot2ResultDisplay && !isLoading || slot1Error && !isLoading || slot2Error && !isLoading ?
                            <>
                                <div className="border-t-2 my-8 w-full"></div>
                                <div className="r-cont">
                                    <span className="flex w-full justify-center gap-8 min-h-[1000px] py-8 px-2 items-center r-wrap-cont">
                                        {
                                            slot1ResultDisplay ?
                                                <ResultWrap>
                                                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                                                        <h2 className="underline font-semibold">{`Model: ${slot1ModelName}`}</h2>
                                                        <ResultRenderTaskbar setCurDisplay={setSlot1ResultDisplay} curRaw={slot1Raw} curOgTxt={slot1Txt} setCurRaw={setSlot1Raw} text={slot1ResultDisplay}></ResultRenderTaskbar>
                                                    </div>
                                                    <div className="pt-8">
                                                        {slot1ResultDisplay}
                                                    </div>
                                                </ResultWrap> : null}
                                        {
                                            slot1Error ?
                                                <ResultWrap>
                                                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                                                        <h2 className="underline font-semibold">Model: Standard</h2>
                                                    </div>
                                                    <div className="pt-8 text-destructive font-semibold">
                                                        {standardResultError}
                                                    </div>
                                                </ResultWrap> : null

                                        }
                                        {
                                            slot2ResultDisplay ?
                                                <ResultWrap>
                                                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                                                        <h2 className="underline font-semibold">{`Model: Better-1`}</h2>
                                                        <ResultRenderTaskbar curOgTxt={slot2Txt} curRaw={slot1Raw} setCurDisplay={setSlot2ResultDisplay} setCurRaw={setSlot1Raw} text={slot2ResultDisplay}></ResultRenderTaskbar>
                                                    </div>
                                                    <div className="pt-8">
                                                        {slot2ResultDisplay}
                                                    </div>
                                                </ResultWrap> : null
                                        }
                                        {
                                            slot2Error ?
                                                <ResultWrap>
                                                    <div className="flex justify-between items-center sm:flex-row flex-col-reverse gap-2 sm:gap-0">
                                                        <h2 className="underline font-semibold">Model: Better-1</h2>
                                                    </div>
                                                    <div className="pt-8 text-destructive font-semibold">
                                                        {better1Error}
                                                    </div>
                                                </ResultWrap> : null

                                        }
                                    </span>
                                </div>
                            </> : null
                        }


                    </div> : null

            }
        </>

    )
}