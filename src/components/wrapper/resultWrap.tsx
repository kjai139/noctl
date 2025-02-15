'use client'
import { SetStateAction, useEffect, useState } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import { string } from "zod"




export default function ResultWrap({ slotModelName, slotMergedLines, setSlotMergedLines, setSlotResultDisplay, setSlotRaw, slotRaw, slotResultDisplay, slotTranslatedTxt, isRawOn, setIsRawOn, clipboardTxt, setClipboardTxt, setIsSlotEditShowing, setSlotEditedText, isSlotEditShowing, slotEditedText, isSlotEditing, setIsSlotEditing }: {
    slotMergedLines: any,
    slotModelName: string,
    slotRaw: string,
    slotResultDisplay: string,
    slotTranslatedTxt: string,
    setSlotResultDisplay: React.Dispatch<SetStateAction<string>>,
    setSlotRaw: React.Dispatch<SetStateAction<string>>,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>
    isRawOn: boolean,
    clipboardTxt: string,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>,
    slotEditedText: string,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,
    isSlotEditShowing: boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>
    isSlotEditing: boolean,
    setIsSlotEditing: React.Dispatch<SetStateAction<boolean>>

}) {

    const [displayTxt, setDisplaytxt] = useState<any>()

    const renderText = () => {
        const normalizedRaw = slotRaw.replace(/\n+/g, '\n').trim()
        const rawlines = normalizedRaw.split('\n').filter(line => line !== '　').map((line) => ({ text: line, color: 'raw' }))
        const normalizedTxt = slotTranslatedTxt.replace(/\n+/g, '\n').trim()
        console.log('translatedTxt:', slotTranslatedTxt)
        console.log('normalizedtxt', normalizedTxt)
        const resultLines = normalizedTxt.split('\n').map((line) => ({ text: line, color: 'result' }))
        const normalizedEditedTxt = slotEditedText.replace(/\n+/g, '\n').trim()
        const editedLines = normalizedEditedTxt.split('\n').map((line) => ({ text: line, color: 'edit' }))

        const maxLines = Math.max(rawlines.length, resultLines.length, editedLines.length)

        let mergedLines = []

        const mergedLinesArr = Array.from({ length: maxLines }).flatMap((_, i) => [
            isRawOn ? (rawlines[i] ?? { text: '', color: 'raw' }) : null,
            resultLines[i] ?? { text: '', color: 'result' },
            isSlotEditShowing ? (editedLines[i] ?? { text: '', color: 'edit' }) : null
        ]).filter(Boolean)



        return mergedLinesArr


        /* for (let i = 0; i < maxLines; i++) {
            const line1 = rawlines[i] || ''
            const line2 = resultLines[i] + '\n' || ''
            const line3 = editedLines[i] + '\n' || ''

            if (isRawOn) {
                mergedLines.push(line1)
            }
            
            mergedLines.push(line2)

            if (isSlotEditShowing) {
                mergedLines.push(line3)
            }

        }

        const mergedTxt = mergedLines.join('\n')
        setClipboardTxt(mergedTxt) */

        /* console.log('[renderText] mergedLines', mergedLines) */
        const renderedLines = mergedLinesArr.map((line, idx) => {
            if (!line) {
                return null
            }
            let color = null
            let margin = null
            if (line.color === 'result') {
                if (!isSlotEditShowing) {
                    margin = 'mb-8'
                }

            } else if (line.color === 'edit') {
                color = 'text-green-700'
                if (isSlotEditShowing) {
                    margin = 'mb-8'
                }
            } else if (line.color === 'raw') {
                color = 'text-muted-foreground'
            }
            return (
                <div key={`line${idx}`}>
                    <p className={`${color} ${margin}`}>
                        {line.text}
                    </p>
                </div>
            )
        })


        return renderedLines

    }


    useEffect(() => {
        if (!isRawOn && !isSlotEditShowing) {
            setClipboardTxt(slotTranslatedTxt)
        } else {
            const text = renderText()
            setDisplaytxt(text)

            const clipboardTxt = text.map((line: any) => {
                if (line.color === 'result') {
                    if (!isSlotEditShowing) {
                        return line.text + '\n'
                    }
                } else if (line.color === 'edit') {
                    if (isSlotEditShowing) {
                        return line.text + '\n'
                    }
                } else if (line.color === 'raw') {
                    return line.text
                }
            }).join('\n')
            console.log('clipboardTxt', clipboardTxt)

            setClipboardTxt(clipboardTxt)
        }
        console.log('TEXT:', displayTxt)
        console.log('clipboard', clipboardTxt)

    }, [isSlotEditShowing, isRawOn, slotResultDisplay])



    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
            <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                <h2 className="underline font-semibold text-stone-600">{`Model: ${slotModelName}`}</h2>
                <ResultRenderTaskbar setSlotMergedLines={setSlotMergedLines} slotRaw={slotRaw} slotTranslatedTxt={slotTranslatedTxt} slotResultDisplay={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn} clipboardTxt={clipboardTxt} setClipboardTxt={setClipboardTxt} setSlotDisplay={setSlotResultDisplay} setIsSlotEditShowing={setIsSlotEditShowing} setSlotEditedText={setSlotEditedText} isSlotEditShowing={isSlotEditShowing} slotEditedText={slotEditedText} isSlotEditing={isSlotEditing} setIsSlotEditing={setIsSlotEditing}></ResultRenderTaskbar>
            </div>
            <div className="py-8 w-cont">
                {isRawOn || isSlotEditShowing ? displayTxt && displayTxt.map((line: { text: string, color: string }, idx: number) => {
                    if (!line) {
                        return null
                    }
                    let color = null
                    let margin = null
                    if (line.color === 'result') {
                        if (!isSlotEditShowing) {
                            margin = 'mb-8'
                        }

                    } else if (line.color === 'edit') {
                        color = 'text-green-700'
                        if (isSlotEditShowing) {
                            margin = 'mb-8'
                        }
                    } else if (line.color === 'raw') {
                        color = 'text-muted-foreground'
                    }
                    return (
                        <div key={`line${idx}`}>
                            <p className={`${color} ${margin}`}>
                                {line.text}
                            </p>
                        </div>
                    )
                }) : slotTranslatedTxt}
            </div>
        </div>
    )
}