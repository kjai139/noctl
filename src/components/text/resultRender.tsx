'use client'
import { useWorkState } from "@/app/_contexts/workStateContext"
import { useEffect, useRef, useState } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import ResultWrap from "../wrapper/resultWrap"
import ErrorResult from "./errorResult"
import { useClipboardContext } from "@/app/_contexts/clipboardContext"
import { useEditTabContext } from "@/app/_contexts/editContext"
import ErrorResultAlert from "../dialog/errorResult"


export default function ResultRender() {

    const { slot1ResultDisplay, setSlot1MergedLines, slot1MergedLines, slot1Txt, slot2MergedLines, setSlot2MergedLines, setSlot1Txt, slot2Txt, setSlot2Txt, isLoading, slot2ResultDisplay, setSlot1ResultDisplay, setSlot2ResultDisplay, setSlot1Raw, slot1Raw, isSlot1RawOn, isSlot2RawOn, setIsSlot1RawOn, setIsSlot2RawOn, slot1ModelName, slot2ModelName, slot1Error, slot2Error } = useWorkState()
    const { clipboard1Txt, clipboard2Txt, setClipboard1Txt, setClipboard2Txt } = useClipboardContext()
    const { setSlot1EditedTxt, setSlot2EditedTxt, slot1EditedText, slot2EditedText, isSlot1EditShowing, isSlot2EditShowing, setIsSlot1EditShowing, setIsSlot2EditShowing, isSlot1Editing, isSlot2Editing, setIsSlot1Editing, setIsSlot2Editing, isSlot1ResultShowing, setIsSlot1ResultShowing, isSlot2ResultShowing, setIsSlot2ResultShowing, setSlot1EditErrorMsg, setSlot2EditErrorMsg, slot1EditErrorMsg, slot2EditErrorMsg } = useEditTabContext()
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
                behavior: 'smooth',
                block: 'center'
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
    }, [isLoading])



    return (
        <>
        {
            slot1EditErrorMsg && !isSlot1Editing ? 
            <ErrorResultAlert errorMsg={slot1EditErrorMsg} setErrorMsg={setSlot1EditErrorMsg}></ErrorResultAlert> : null
        }
        {
            slot2EditErrorMsg && !isSlot2Editing ?
            <ErrorResultAlert errorMsg={slot2EditErrorMsg} setErrorMsg={setSlot2EditErrorMsg}></ErrorResultAlert> : null
        }
            {
                isLoading || slot1ResultDisplay || slot2ResultDisplay || slot1Error && slot2Error ?
                    <div className="flex items-center justify-center flex-col relative min-h-screen">

                        {isLoading ?
                            <>
                                <div className="absolute">
                                    <div className="flex flex-col gap-2">
                                        <div className="flex gap-2 items-end font-bold text-lg justify-between">
                                            <div className="loader" ref={loadingRef}>
                                            </div>
                                            <span>
                                                {`${seconds > 0 ? seconds : '0'}s`}
                                            </span>
                                        </div>

                                        <span className="justify-center text-muted-foreground">{`...It might take a min, please be patient.`}</span>
                                    </div>
                                </div>
                            </>
                            : null
                        }

                        {slot1ResultDisplay && !isLoading || slot2ResultDisplay && !isLoading || slot1Error && !isLoading || slot2Error && !isLoading ?
                            <>
                                <div className="border-t-2 my-8 w-full"></div>
                                <div className="r-cont">
                                    <span className="flex w-full justify-center gap-8 min-h-[1000px] py-8 px-2 items-start r-wrap-cont mb-20 h-full">
                                        
                                        {
                                            slot1ResultDisplay ?
                                                <ResultWrap
                                                slotMergedLines={slot1MergedLines} 
                                                setSlotMergedLines={setSlot1MergedLines}
                                                setSlotRaw={setSlot1Raw} setSlotResultDisplay={setSlot1ResultDisplay}
                                                slotModelName={slot1ModelName}
                                                slotTranslatedTxt={slot1Txt}
                                                slotRaw={slot1Raw}
                                                slotResultDisplay={slot1ResultDisplay}
                                                isRawOn={isSlot1RawOn}
                                                setIsRawOn={setIsSlot1RawOn}
                                                clipboardTxt={clipboard1Txt}
                                                setClipboardTxt={setClipboard1Txt}
                                                setIsSlotEditShowing={setIsSlot1EditShowing}
                                                isSlotEditShowing={isSlot1EditShowing}
                                                slotEditedText={slot1EditedText}
                                                setSlotEditedText={setSlot1EditedTxt}
                                                isSlotEditing={isSlot1Editing}
                                                setIsSlotEditing={setIsSlot1Editing}
                                                isSlotResultShowing={isSlot1ResultShowing}
                                                setIsSlotResultShowing={setIsSlot1ResultShowing}
                                                setSlotEditErrorMsg={setSlot1EditErrorMsg}
                                                >
                                                </ResultWrap> : null}
                                        {
                                            slot1Error ?
                                                <ErrorResult slotError={slot1Error}
                                                slotModelName={slot1ModelName}
                                                >
                                                </ErrorResult> : null

                                        }
                                        {
                                            slot2ResultDisplay ?
                                            <ResultWrap
                                            slotMergedLines={slot2MergedLines}
                                            setSlotMergedLines={setSlot2MergedLines} 
                                            setSlotRaw={setSlot1Raw} setSlotResultDisplay={setSlot2ResultDisplay}
                                            slotModelName={slot2ModelName}
                                            slotTranslatedTxt={slot2Txt}
                                            slotRaw={slot1Raw}
                                            slotResultDisplay={slot2ResultDisplay}
                                            isRawOn={isSlot2RawOn}
                                            setIsRawOn={setIsSlot2RawOn}
                                            clipboardTxt={clipboard2Txt}
                                            setClipboardTxt={setClipboard2Txt}
                                            setIsSlotEditShowing={setIsSlot2EditShowing}
                                            isSlotEditShowing={isSlot2EditShowing}
                                            slotEditedText={slot2EditedText}
                                            setSlotEditedText={setSlot2EditedTxt}
                                            isSlotEditing={isSlot2Editing}
                                            setIsSlotEditing={setIsSlot2Editing}
                                            isSlotResultShowing={isSlot2ResultShowing}
                                            setIsSlotResultShowing={setIsSlot2ResultShowing}
                                            setSlotEditErrorMsg={setSlot2EditErrorMsg}
                                            >
                                            </ResultWrap> : null
                                        }
                                        {
                                            slot2Error ?
                                            <ErrorResult slotError={slot2Error}
                                            slotModelName={slot2ModelName}
                                            >
                                            </ErrorResult> : null

                                        }
                                    </span>
                                </div>
                            </> : null
                        }


                    </div> : null

            }
        </>

    )
}