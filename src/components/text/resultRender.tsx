'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"
import { useEffect, useRef, useState } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import ResultWrap from "../wrapper/resultWrap"


export default function ResultRender () {

    const { curResult, ogCurResult, setOgCurResult, ogAltResult, setOgAltResult, isLoading, altResult1, setCurResult, setCurRaw, curRaw, setAltResult1, standardResultError, better1Error } = useWorkState()
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
                behavior:'smooth',
                block:'center'
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
    },[isLoading])

    
    return (
        <>
        {
            isLoading || curResult || altResult1 ? 
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

            {curResult && !isLoading || altResult1 && !isLoading || standardResultError && !isLoading || better1Error && !isLoading ?
            <>
            <div className="border-t-2 my-8 w-full"></div>
            <div className="r-cont">
                <span className="flex w-full justify-center gap-8 min-h-[1000px] py-8 px-2 items-center r-wrap-cont">
            {
                curResult ?
                <ResultWrap>
                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                    <h2 className="underline font-semibold">Model: Standard</h2>
                    <ResultRenderTaskbar setCurDisplay={setCurResult} curRaw={curRaw} curOgTxt={ogCurResult} setCurRaw={setCurRaw} text={curResult}></ResultRenderTaskbar>
                    </div>
                    <div className="pt-8">
                    {curResult}
                    </div>
            </ResultWrap> : null}
            {
                standardResultError ? 
                <ResultWrap>
                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                        <h2 className="underline font-semibold">Model: Standard</h2>
                    </div>
                    <div className="pt-8">
                        {standardResultError}
                    </div>
                </ResultWrap> : null

            }
            {
                altResult1 ? 
                <ResultWrap>
                    <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                    <h2 className="underline font-semibold">{`Model: Better-1`}</h2>
                    <ResultRenderTaskbar curOgTxt={ogAltResult} curRaw={curRaw} setCurDisplay={setAltResult1} setCurRaw={setCurRaw} text={altResult1}></ResultRenderTaskbar>
                    </div>
                <div className="pt-8">
                {altResult1}
                </div>
                </ResultWrap> : null
            }
            {
                better1Error ? 
                <ResultWrap>
                    <div className="flex justify-between items-center sm:flex-row flex-col-reverse gap-2 sm:gap-0">
                        <h2 className="underline font-semibold">Model: Better-1</h2>
                    </div>
                    <div className="pt-8">
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