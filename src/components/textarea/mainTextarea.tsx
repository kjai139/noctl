'use client'
import { useEffect, useRef, useState } from "react";
import { Textarea } from "../ui/textarea";

interface mainTextAreaProps {
    field: any
    isDisabled: boolean
}   

export default function MainTextArea ({
    field,
    isDisabled
}:mainTextAreaProps) {

    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const indexRef = useRef(0)
    const charIndexRef = useRef(0)
    const isDeletingRef = useRef(false)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    

    const placeholderTexts = [
        "Paste some text here...",
        "Paste a novel chapter here...",
        "Paste a news article here...",
    ]

    useEffect(() => {
        let curText = placeholderTexts[indexRef.current]
        charIndexRef.current = placeholderTexts[0].length

        const typeEffect = () => {
            if (textareaRef.current) {
                // if textarea exists
                if (!isDeletingRef.current) {
                    // if it's not deleting
                    if (charIndexRef.current < curText.length ) {
                        textareaRef.current.placeholder = curText.substring(0, charIndexRef.current + 1)
                        charIndexRef.current++
                        timeoutRef.current = setTimeout(typeEffect, 100)
                    } else {
                        //init deleting backwards
                        timeoutRef.current = setTimeout(() => {
                            isDeletingRef.current = true
                            typeEffect() 
                        }, 1500)
                    }
                } else {
                    //isDeleting true
                    if (charIndexRef.current > 5) {
                        textareaRef.current.placeholder = curText.substring(0, charIndexRef.current - 1)
                        charIndexRef.current--
                        timeoutRef.current = setTimeout(typeEffect, 50)
                    } else {
                        isDeletingRef.current = false
                        indexRef.current = (indexRef.current + 1) % placeholderTexts.length
                        
                        curText = placeholderTexts[indexRef.current]
                        /* console.log('indexref:', indexRef.current) */
                        timeoutRef.current = setTimeout(typeEffect, 500)
                    }
                }
            }
        }
        typeEffect()

        return () => clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>)
    }, [])

    return (

        <Textarea maxLength={13000} onInput={(e) => {
            const target = e.target as HTMLTextAreaElement
            target.style.height = 'auto';
            target.style.height = `${target.scrollHeight}px`;
        }} {...field} placeholder="Paste some text here..." className="max-h-[300px] w-full border-none shadow-none resize-none main-ta focus-visible:ring-0 text-base" disabled={isDisabled} ref={textareaRef}>

        </Textarea>
    )
}