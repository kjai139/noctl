import DisplayRawBtn from "../buttons/displayRawBtn"
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"
import EditTextBtn from "../buttons/editTextBtn"
import DisplayEditedTxtBtn from "../buttons/displayEditTxtBtn"

interface ResultRenderTaskbarProps {
    curRaw: string, // untranslated raw txt
    slotTranslatedTxt: string,  //translated txt used for processing. eg in raw toggle
    slotResultDisplay: string, //translated text for display
    isRawOn: boolean,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>,
    clipboardTxt: string,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>,
    setSlotDisplay: React.Dispatch<SetStateAction<string>>,

    slotEditedText: string,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,

    isSlotEditShowing:boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>,
}

export default function ResultRenderTaskbar ({setSlotMergedLines, curRaw, slotTranslatedTxt, setIsRawOn, isRawOn, slotResultDisplay, clipboardTxt, setClipboardTxt, setSlotDisplay, setSlotEditedText, slotEditedText, isSlotEditShowing, setIsSlotEditShowing}:ResultRenderTaskbarProps) {

    return (
        <div className="flex gap-2 shadow-lg rounded-sm p-2">
        <DisplayRawBtn setSlotMergedLines={setSlotMergedLines} slotRaw={curRaw} slotTranslatedTxt={slotTranslatedTxt} setIsRawOn={setIsRawOn} isRawOn={isRawOn} setClipboardTxt={setClipboardTxt}></DisplayRawBtn>
        <EditTextBtn slotRaw={curRaw} slotTxt={slotResultDisplay} setSlotDisplay={setSlotDisplay} setSlotEditedText={setSlotEditedText}></EditTextBtn>
        <CopyTextBtn isRawOn={isRawOn} text={slotResultDisplay} clipboardTxt={clipboardTxt}></CopyTextBtn>
        {
            slotEditedText ? 
            <DisplayEditedTxtBtn setIsSlotEditShowing={setIsSlotEditShowing} isSlotEditShowing={isSlotEditShowing}></DisplayEditedTxtBtn> : null
        }
        </div>
    )
}