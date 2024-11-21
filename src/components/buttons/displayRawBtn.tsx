'use client'
import { SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { TbListDetails } from "react-icons/tb";

interface DisplayRawBtnProps {
    setCurDisplay: any,
    curRaw: string,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>
    curOgTxt: string,
    isRawOn:boolean,
}

export default function DisplayRawBtn ({setCurDisplay, curRaw, setIsRawOn, isRawOn, curOgTxt}:DisplayRawBtnProps) {

    

    const toggleRaw = () => {
        console.log('[Toggle Raw] curRaw : ', curRaw)
        console.log('[Toggle Raw] curOgTxt: ', curOgTxt)
        if (!isRawOn) {
            const normalizedRaw = curRaw.replace(/\n+/g, '\n').trim()
            const rawlines = normalizedRaw.split('\n').filter(line => line !== '　')
            const normalizedTxt = curOgTxt.replace(/\n+/g, '\n').trim()
            const resultLines = normalizedTxt.split('\n')

            const maxLines = Math.max(rawlines.length, resultLines.length)

            let mergedLines = []
            for (let i = 0; i < maxLines; i++) {
                const line1 = rawlines[i] || ''
                const line2 = resultLines[i] + '\n' || ''

                mergedLines.push(line1)
                mergedLines.push(line2)

            }

            console.log('RAW ARRAY NORMALIZED:', normalizedRaw)
            console.log('RAW TEXT NORMALIZED', normalizedTxt)

            const result = mergedLines.join('\n')
            setCurDisplay(result)
            setIsRawOn(true)
        } else if (isRawOn) {
            setCurDisplay(curOgTxt)
            setIsRawOn(false)
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