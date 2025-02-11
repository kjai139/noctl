import { ClaudeEdit } from "@/app/action";
import { Button } from "../ui/button";
import React, { SetStateAction } from "react";
import { BiMessageAltEdit } from "react-icons/bi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface EditTextBtnProps {
    slotRaw: string,
    slotTxt: string,
    setIsSlotEditing?: React.Dispatch<SetStateAction<boolean>>,
    setSlotDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,
}

export default function EditTextBtn({ slotRaw, slotTxt, setIsSlotEditing, setSlotDisplay, setSlotEditedText }: EditTextBtnProps) {



    const getLinebyLineTxt = () => {
        const normalizedRaw = slotRaw.replace(/\n+/g, '\n').trim()
        const rawlines = normalizedRaw.split('\n').filter(line => line !== '　')
        const normalizedTxt = slotTxt.replace(/\n+/g, '\n').trim()
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
        console.log('[EditTextBtn] merged text:', mergedTxt)
        return mergedTxt



    }

    const editText = async () => {
        const lineByLine = getLinebyLineTxt()
        const prompt = `Please review this text line by line, checking its translation by comparing the lines. Remove any hallucinations and make improvements where you can, and then return a list of lines. \n ###Text \n ${lineByLine}`
        console.log('[editText] prompt used: ', prompt)
        try {
            const response: any = await ClaudeEdit({
                prompt: prompt
            })
            //message.content returned
            console.log('[editText] response', response)

            const linesArr = response[0].input.result_array
            console.log(linesArr)
            const formattedTextResult = linesArr.map((line: any) => line.translated_line).join('\n')
            setSlotEditedText(formattedTextResult)


        } catch (err) {
            console.error('[editTxt] error', err)
        }

    }



    return (
        
        <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
                
                <Button onClick={editText} size={'icon'} variant={'outline'}>
                    <BiMessageAltEdit size={23} />
                </Button>
            </TooltipTrigger>
            <TooltipContent side="top" className="flixed left-0 top-0">
                <p>Quality Check</p>
            </TooltipContent>
        </Tooltip>
        

    )
}