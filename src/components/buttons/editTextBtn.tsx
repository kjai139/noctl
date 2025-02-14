import { ClaudeEdit } from "@/app/action";
import { Button } from "../ui/button";
import React, { SetStateAction, useState } from "react";
import { BiMessageAltEdit } from "react-icons/bi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { TbCircleLetterRFilled } from "react-icons/tb";
import { useWorkState } from "@/app/_contexts/workStateContext";


interface EditTextBtnProps {
    slotRaw: string,
    slotTxt: string,
    setIsSlotEditing: React.Dispatch<SetStateAction<boolean>>,
    setSlotDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,
    isSlotEditing: boolean,
   
}

export default function EditTextBtn({ slotRaw, slotTxt, setIsSlotEditing, setSlotDisplay, setSlotEditedText, isSlotEditing }: EditTextBtnProps) {

    const [isTooltipAllowed, setIsTooltipAllowed] = useState(false)
    const { userCurrency } = useWorkState()
    const [isDialogOpen, setIsDialogOpen] = useState(false)

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
            setIsSlotEditing(true)
            const response: any = await ClaudeEdit({
                prompt: prompt
            })
            //message.content returned
            console.log('[editText] response', response)

            const linesArr = response[0].input.result_array
            console.log(linesArr)
            const formattedTextResult = linesArr.map((line: any) => line.translated_line).join('\n')
            setSlotEditedText(formattedTextResult)
            setIsSlotEditing(false)


        } catch (err) {
            console.error('[editTxt] error', err)
        }

    }



    return (
        <AlertDialog onOpenChange={(open) => {setIsTooltipAllowed(false); setIsDialogOpen(open)}} open={isDialogOpen}>
            
                <Tooltip>

                    <TooltipTrigger asChild onPointerEnter={() => setIsTooltipAllowed(true)} onMouseLeave={() => setIsTooltipAllowed(false)}>


                        <AlertDialogTrigger asChild>
                            <Button size={'icon'} variant={'outline'} disabled={isSlotEditing}>
                                <BiMessageAltEdit size={23} />
                            </Button>
                        </AlertDialogTrigger>

                    </TooltipTrigger>
                  
                        { isTooltipAllowed && <TooltipContent side="top" className="flixed left-0 top-0">
                            <p>Check translation</p>
                        </TooltipContent>}
                    

                </Tooltip>
            
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Quality Check
                    </AlertDialogTitle>
                    <AlertDialogDescription className="flex flex-col">
                        <span>This function will use the best paid model to check the quality of the translation, looking to fix any hallucinations and errors.</span>
                        <span className="mt-2">
                            It costs <strong>1</strong> <TbCircleLetterRFilled size={18} className="inline text-primary"></TbCircleLetterRFilled> credit to perform. {
                                userCurrency && userCurrency > 0 ? 'Proceed?' : 'You do not have enough request currency, please add more at the currency tab.'
                            }
                        </span>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                 <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    {
                        userCurrency && userCurrency > 0 ?
                        <AlertDialogAction onClick={() => {console.log('confirmed'); setIsDialogOpen(false)}}>
                        Confirm
                         </AlertDialogAction> : null
                    }
                    
                   
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>

    )
}