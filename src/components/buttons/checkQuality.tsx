'use client'
import { ClaudeEdit } from "@/app/action";
import { Button } from "../ui/button";
import React, { SetStateAction, useEffect, useState } from "react";
import { BiMessageAltEdit } from "react-icons/bi";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog";
import { TbCircleLetterRFilled } from "react-icons/tb";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { pollJobStatus } from "@/app/_utils/pollJobStatus";
import useButtonDisabled from "@/hooks/use-disabled";


interface CheckQualityBtnProps {
    slotRaw: string,
    slotTxt: string,

    setSlotDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,
    isSlotEditing: boolean,
    setIsSlotEditing: React.Dispatch<SetStateAction<boolean>>,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>,
    setSlotEditErrorMsg: React.Dispatch<SetStateAction<string>>,

}

export default function CheckQualityBtn({ slotRaw, slotTxt, setIsSlotEditing, setSlotDisplay, setSlotEditedText, isSlotEditing, setIsSlotEditShowing, setSlotEditErrorMsg }: CheckQualityBtnProps) {

    const [isTooltipAllowed, setIsTooltipAllowed] = useState(false)
    const { userCurrency } = useWorkState()
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const isDisabled = useButtonDisabled()

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

    const checkQuality = async () => {
        const lineByLine = getLinebyLineTxt()
        const prompt = `Please review this text line by line, checking its translation by comparing the lines. Remove any hallucinations and make improvements where you can, and then return a list of lines. \n ###Text \n ${lineByLine}`
        console.log('[editText] prompt used: ', prompt)
        const txtLength = lineByLine.length
        let pollInterval = 5000
        // 1sec is 1k
        if (txtLength < 150) {
            pollInterval = 5000
        } else if (txtLength > 150 && txtLength < 500) {
            pollInterval = 10000
        } else if (txtLength > 500 && txtLength < 1000) {
            pollInterval = 20000
        } else if (txtLength > 1000) {
            pollInterval = 30000
        }
        try {
            setIsDialogOpen(false)
            setIsSlotEditing(true)
            const startTime = Date.now()
            const jobId = await ClaudeEdit({
                prompt: prompt
            })
            if (!jobId) {
                console.error('[e-1] Missing job Id')
                throw new Error('Something went wrong -_-, please try again later.')
            }
            console.log('[B1 Model] JobId:', jobId)
            const pollResponse = await pollJobStatus({
                jobId: jobId,
                startTime: startTime,
                interval: pollInterval,
            })
            //message.content returned
            console.log('[editText] jobId', jobId)

            if (pollResponse.job.jobStatus === 'failed') {
                       
                if (typeof pollResponse.job.response === 'string') {
                    console.error('Error from poll in str:', pollResponse.job.response)
                    throw new Error('Encountered a server error. Please try again later.')
                } else {
                    throw new Error('Something went wrong *_*. Please try again later.')
                }
               

                
            }
            let jsonResponse
            try {
                jsonResponse = JSON.parse(pollResponse.job.response)
            } catch (err) {
                console.error('[checkQuality] JSON parse failed:', pollResponse.job.response)
                throw new Error('Encountered a server error. Please try again later.')
            }

            const linesArr = jsonResponse[0].input.result_array
            console.log('[QC] Edited text array', linesArr)
            const formattedTextResult = linesArr.map((line: any) => line.translated_line).join('\n')
            setSlotEditedText(formattedTextResult)
            setIsSlotEditShowing(true)
            setIsSlotEditing(false)


        } catch (err) {
            if (err instanceof Error) {
                setSlotEditErrorMsg(err.message)
            } else {
                console.error('[CheckQuality] Encountered an unknown error')
                setSlotEditErrorMsg('Encountered an unknown error. Please try again later.')
            }
            setIsSlotEditing(false)
            console.error('[CheckQuality] error', err)
            
        }

    }

    const textFunc = ({mode}: {
        mode: 'error' | 'load'
    }) => {
        setIsDialogOpen(false)
        setIsSlotEditing(true)
        if (mode === 'load') {
            setTimeout(() => {
                setIsSlotEditing(false)
                setIsSlotEditShowing(true)
                setSlotEditedText("Here's some text for testing purposes. ")
            }, 1000)
        } else if (mode === 'error') {
            setTimeout(() => {
                setIsSlotEditing(false)
                setSlotEditErrorMsg('Encountered an test error. Please try again later.')
            }, 5000)
        }
                
    }

    useEffect(() => {
        console.log('IS SLOT EIDITNG', isSlotEditing)
    }, [isSlotEditing, setIsSlotEditing])




    return (
        <>
            {/* <Button onClick={textFunc}>Test</Button> */}
            <AlertDialog onOpenChange={(open) => { setIsTooltipAllowed(false); setIsDialogOpen(open) }} open={isDialogOpen}>

                <Tooltip>

                    <TooltipTrigger asChild onPointerEnter={() => setIsTooltipAllowed(true)} onMouseLeave={() => setIsTooltipAllowed(false)}>


                        <AlertDialogTrigger asChild>
                            <Button size={'icon'} variant={'outline'} disabled={isDisabled}>
                                <BiMessageAltEdit size={23} />
                            </Button>
                        </AlertDialogTrigger>

                    </TooltipTrigger>

                    {isTooltipAllowed && <TooltipContent side="top" className="flixed left-0 top-0">
                        <p>Check translation</p>
                    </TooltipContent>}


                </Tooltip>

                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Quality Check
                        </AlertDialogTitle>
                        <AlertDialogDescription className="flex flex-col gap-2">
                            <span>When using AI to translate a large amount of text, sometimes they will hallucinate and add in text unrelated to the input.</span>
                            <span>
                            This function will use the best paid model to check the quality of the translation, looking to fix any hallucinations.
                            </span>
                            <span>
                            Use this function if you suspect there are hallucinations, it will show the result lines in green which you can toggle on and off in the visibility tab.
                            </span>
                            <span className="mt-2">
                                It costs <strong>1</strong> <TbCircleLetterRFilled size={18} className="inline text-primary"></TbCircleLetterRFilled> credit to perform this action. {
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
                                <AlertDialogAction onClick={() => textFunc({mode:'load'})}>
                                    Confirm
                                </AlertDialogAction> : null
                        }


                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}