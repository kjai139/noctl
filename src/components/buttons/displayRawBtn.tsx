'use client'
import React, { SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { TbListDetails } from "react-icons/tb";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { useClipboardContext } from "@/app/_contexts/clipboardContext";

interface DisplayRawBtnProps {
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>,
    slotRaw: string,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>
    slotTranslatedTxt: string,
    isRawOn:boolean,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>
}

export default function DisplayRawBtn ({setSlotMergedLines, slotRaw, setIsRawOn, isRawOn, slotTranslatedTxt, setClipboardTxt}:DisplayRawBtnProps) {

   

    const setRawOn = () => {
        console.log('[setRawOn]: slotTranslatedTxt', slotTranslatedTxt)
        const normalizedRaw = slotRaw.replace(/\n+/g, '\n').trim()
            const rawlines = normalizedRaw.split('\n').filter(line => line !== '　')
            const normalizedTxt = slotTranslatedTxt.replace(/\n+/g, '\n').trim()
            const resultLines = normalizedTxt.split('\n')

            const maxLines = Math.max(rawlines.length, resultLines.length)

            let mergedLines = []
            for (let i = 0; i < maxLines; i++) {
                const line1 = rawlines[i] || ''
                const line2 = resultLines[i] + '\n' || ''

                mergedLines.push(line1)
                mergedLines.push(line2)

            }

            const mergedTxt = mergedLines.join('\n')
            setClipboardTxt(mergedTxt)

            console.log('[renderText] mergedLines', mergedLines)
            setSlotMergedLines(mergedLines)
            setIsRawOn(true)

            

    }

    const toggleRaw = () => {
        /* console.log('[Toggle Raw] curRaw : ', curRaw)
        console.log('[Toggle Raw] curOgTxt: ', curOgTxt) */
        if (!isRawOn) {
        
            setRawOn()
        } else if (isRawOn) {
            /* setCurDisplay(curOgTxt) */
            setIsRawOn(false)
            console.log('slotTranslatedTxt', slotTranslatedTxt)
        }
        

    }

    return (
        <div>
            <Button onClick={toggleRaw} variant={'secondary'}>
                <div className="flex gap-2 items-center">
                    <TbListDetails></TbListDetails>
                    <span>Raw</span>

                </div>
            </Button>
        </div>
    )
}