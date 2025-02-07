import DisplayRawBtn from "../buttons/displayRawBtn"
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"
import EditTextBtn from "../buttons/editTextBtn"

interface ResultRenderTaskbarProps {
    curRaw: string, // untranslated raw txt
    curOgTxt: string,
    text: string,
    isRawOn: boolean,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>,
    clipboardTxt: string,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>
}

export default function ResultRenderTaskbar ({setSlotMergedLines, curRaw, curOgTxt, setIsRawOn, isRawOn, text, clipboardTxt, setClipboardTxt}:ResultRenderTaskbarProps) {

    return (
        <div className="flex gap-2">
        <DisplayRawBtn setSlotMergedLines={setSlotMergedLines} slotRaw={curRaw} slotTxt={curOgTxt} setIsRawOn={setIsRawOn} isRawOn={isRawOn} setClipboardTxt={setClipboardTxt}></DisplayRawBtn>
        <EditTextBtn slotRaw={curRaw} slotTxt={text}></EditTextBtn>
        <CopyTextBtn isRawOn={isRawOn} text={text} clipboardTxt={clipboardTxt}></CopyTextBtn>
        </div>
    )
}