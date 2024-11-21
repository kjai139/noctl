
import { SetStateAction } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"




export default function ResultWrap({ slotModelName, setSlotResultDisplay, setSlotRaw, slotRaw, slotResultDisplay, slotTxt, isRawOn, setIsRawOn}: {
    slotModelName:string,
    slotRaw: string,
    slotResultDisplay: string,
    slotTxt: string,
    setSlotResultDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotRaw: React.Dispatch<SetStateAction<string>>,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    isRawOn: boolean,
}) {

    
    

    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
            <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                <h2 className="underline font-semibold">{`Model: ${slotModelName}`}</h2>
                <ResultRenderTaskbar setCurDisplay={setSlotResultDisplay} curRaw={slotRaw} curOgTxt={slotTxt} setCurRaw={setSlotRaw} text={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn}></ResultRenderTaskbar>
            </div>
            <div className="pt-8">
                {slotResultDisplay}
            </div>
        </div>
    )
}