'use client'
import React, { SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { TbListDetails } from "react-icons/tb";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { useClipboardContext } from "@/app/_contexts/clipboardContext";
import { toolbarIconSize } from "@/lib/toolbarIcons";

interface DisplayRawBtnProps {
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>,
    slotRaw: string,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>
    slotTranslatedTxt: string,
    isRawOn: boolean,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>
    editedText: string,
    isEditShowing: boolean,
}

export default function DisplayRawBtn({ setSlotMergedLines, slotRaw, setIsRawOn, isRawOn, slotTranslatedTxt, setClipboardTxt, editedText, isEditShowing }: DisplayRawBtnProps) {



    const setRawOn = () => {
        console.log('[setRawOn]: slotTranslatedTxt', slotTranslatedTxt)
        const normalizedRaw = slotRaw.replace(/\n+/g, '\n').trim()
        const rawlines = normalizedRaw.split('\n').filter(line => line !== '　')
        const normalizedTxt = slotTranslatedTxt.replace(/\n+/g, '\n').trim()
        const resultLines = normalizedTxt.split('\n')
        const normalizedEditedTxt = editedText.replace(/\n+/g, '\n').trim()
        const editedLines = normalizedEditedTxt.split('\n')


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

            setIsRawOn(true)
        } else if (isRawOn) {
            /* setCurDisplay(curOgTxt) */
            setIsRawOn(false)
            console.log('slotTranslatedTxt', slotTranslatedTxt)
        }


    }

    return (
        <div>
            <Button onClick={toggleRaw} variant={'secondary'}>
                {
                    isRawOn ?
                        <div className="flex gap-2 items-center">


                            <TbListDetails size={toolbarIconSize}></TbListDetails>
                            <span>Hide Raw</span>

                        </div> :
                        <div className="flex gap-2 items-center">


                            <TbListDetails size={toolbarIconSize}></TbListDetails>
                            <span>Show Raw</span>

                        </div>
                }

            </Button>
        </div>
    )
}