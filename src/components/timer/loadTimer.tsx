'use client'

import { Loader2 } from "lucide-react"
import { useEffect, useState } from "react"



export default function LoadTimer() {

    
    const [idx, setIdx] = useState(0)
    const msgs = [
        'Checking translation...',
        'This can take a min...',
        'Looking for errors...',
        'Looking for hallucinations...',
        'Please be patient...',
        'Almost there...'
    ]

    useEffect(() => {

       

        const interval2 = setInterval(() => {
            setTimeout(() => {
                setIdx((prev) => (prev + 1) % msgs.length)
            }, 4000)

        }, 4000)


        return () => {
            
            if (interval2) {
                clearInterval(interval2)
            }
        }
    }, [])


    return (

        <span className="flex gap-1 animate-pulse items-center">
            <Loader2 size={20} className="animate-spin"></Loader2>
            <span>{`${msgs[idx]}`}</span>
        </span>

    )
}