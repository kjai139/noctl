import DisplayRawBtn from "../buttons/displayRawBtn"
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"

interface ResultRenderTaskbarProps {
    setCurDisplay: React.Dispatch<SetStateAction<string>>,
    curRaw: string,
    curOgTxt: string,
    setCurRaw: React.Dispatch<SetStateAction<string>>,
    text: string,
    isRawOn: boolean,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>
}

export default function ResultRenderTaskbar ({setCurDisplay, curRaw, curOgTxt, setCurRaw, setIsRawOn, isRawOn, text}:ResultRenderTaskbarProps) {

    return (
        <div className="flex gap-2">
        <DisplayRawBtn setCurDisplay={setCurDisplay} curRaw={curRaw} curOgTxt={curOgTxt} setIsRawOn={setIsRawOn} isRawOn={isRawOn}></DisplayRawBtn>
        <CopyTextBtn text={text}></CopyTextBtn>
        </div>
    )
}