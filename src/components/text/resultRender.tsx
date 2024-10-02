'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"
import { useEffect, useRef, useState } from "react"
import CopyTextBtn from "../buttons/copyTextBtn"
import DisplayRawBtn from "../buttons/displayRawBtn"


export default function ResultRender () {

    const { curResult, ogCurResult, setOgCurResult, ogAltResult, setOgAltResult, isLoading, altResult1, setCurResult, setCurRaw, curRaw, setAltResult1 } = useWorkState()
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
            <div className="loader" ref={loadingRef}>
            </div>
            <span className="justify-center">{`${seconds > 0 ? seconds : null}s...It might take a second`}</span>
            </div>
            </div>
            </>
            : null
            }

            {curResult && !isLoading || altResult1 && !isLoading ?
            <>
            <div className="border-t-2 my-8 w-full"></div>
            <div className="flex w-full justify-center">
            {
                curResult ?
                <div className="whitespace-pre-line p-10 mb-8 relative max-w-[800px] flex-1">
                <h2 className="underline font-semibold">Model: Standard</h2>
                <div className="absolute right-10 top-0 flex gap-2">
                <DisplayRawBtn setCurDisplay={setCurResult} curRaw={curRaw} curOgTxt={ogCurResult} setCurRaw={setCurRaw}></DisplayRawBtn>
                <CopyTextBtn text={curResult}></CopyTextBtn>
                </div>
                <div className="pt-8">
                {curResult}
                </div>
            </div> : null}
            {
                altResult1 && !isLoading ? 
                <div className="flex-1 relative whitespace-pre-line p-10 mb-8 max-w-[800px]">
                    <h2 className="underline font-semibold">{`Model: Better-1`}</h2>
                    <div className="absolute right-10 top-0 flex gap-2">
                    <DisplayRawBtn curOgTxt={ogAltResult} setCurDisplay={setAltResult1} curRaw={curRaw} setCurRaw={setCurRaw}></DisplayRawBtn>
                    <CopyTextBtn text={altResult1}></CopyTextBtn>
                    </div>
                <div className="pt-8">
                {altResult1}
                </div>
                </div> : null
            }
            </div>
            </> : null
            }
            

        </div> : null

        }
        </>
        
    )
}