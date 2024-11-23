'use client'
import { SetStateAction } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import { useClipboardContext } from "@/app/_contexts/clipboardContext"




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

    const { clipboardTxt, setClipboardTxt} = useClipboardContext()

    const renderText = () => {
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
            setClipboardTxt(mergedTxt)

            console.log('[renderText] mergedLines', mergedLines)

            return mergedLines.map((line, idx) => {
                return (
                    <div key={`line${idx}`}>
                        <p className={`${idx % 2 === 0? 'text-muted-foreground' : 'mb-8'}`}>
                            {line}
                        </p>
                    </div>
                )
            })

    }

    
    

    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
            <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                <h2 className="underline font-semibold">{`Model: ${slotModelName}`}</h2>
                <ResultRenderTaskbar setCurDisplay={setSlotResultDisplay} curRaw={slotRaw} curOgTxt={slotTxt} setCurRaw={setSlotRaw} text={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn}></ResultRenderTaskbar>
            </div>
            <div className="pt-8">
                {isRawOn ? renderText() : slotResultDisplay}
            </div>
        </div>
    )
}