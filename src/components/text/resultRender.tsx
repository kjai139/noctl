'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"
import { useEffect, useRef, useState } from "react"


export default function ResultRender () {

    const { curResult, isLoading } = useWorkState()
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
            isLoading || curResult ? 
            <div className="flex items-center justify-center flex-col relative min-h-screen">
            
            {isLoading ?
            <>
            <div className="absolute">
                <div className="flex flex-col gap-2">
            <div className="loader" ref={loadingRef}>
            </div>
            <span className="justify-center">{seconds > 0 ? seconds : null}s</span>
            </div>
            </div>
            </>
            : null
            }

            {curResult && !isLoading ?
            <>
            <div className="border-t-2 my-8 w-full"></div>
            <div className="whitespace-pre-line p-10">
                {curResult}
            </div>
            </> : null
            }
            

        </div> : null

        }
        </>
        
    )
}