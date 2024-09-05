'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"


export default function ResultRender () {

    const { curResult, isLoading } = useWorkState()

    
    return (
        <div className="flex items-center justify-center flex-col">
            
            {isLoading ?
            <>
            <div className="border-t-2"></div>
            <div className="loader">

            </div>
            </>
            :
            <>
            <div className="border-t-2 my-8"></div>
            <div className="whitespace-pre-line p-10">
                {curResult}
            </div>
            </>
            }
            

        </div>
    )
}