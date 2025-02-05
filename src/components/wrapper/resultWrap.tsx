'use client'
import { SetStateAction } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"




export default function ResultWrap({ slotModelName, slotMergedLines, setSlotMergedLines, setSlotResultDisplay, setSlotRaw, slotRaw, slotResultDisplay, slotTxt, isRawOn, setIsRawOn, clipboardTxt, setClipboardTxt}: {
    slotMergedLines: any,
    slotModelName:string,
    slotRaw: string,
    slotResultDisplay: string,
    slotTxt: string,
    setSlotResultDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotRaw: React.Dispatch<SetStateAction<string>>,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>
    isRawOn: boolean,
    clipboardTxt: string,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>
}) {



    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
            <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                <h2 className="underline font-semibold text-stone-600">{`Model: ${slotModelName}`}</h2>
                <ResultRenderTaskbar setSlotMergedLines={setSlotMergedLines} curRaw={slotRaw} curOgTxt={slotTxt} text={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn} clipboardTxt={clipboardTxt} setClipboardTxt={setClipboardTxt}></ResultRenderTaskbar>
            </div>
            <div className="py-8">
                {isRawOn ?
                slotMergedLines && slotMergedLines.length > 0 ? 
                slotMergedLines.map((line:any, idx:number) => {
                    return (
                        <div key={`line${idx}`}>
                            <p className={`${idx % 2 === 0? 'text-muted-foreground' : 'mb-8'}`}>
                                {line}
                            </p>
                        </div>
                    )
                }) : null 
                 : slotResultDisplay}
            </div>
        </div>
    )
}