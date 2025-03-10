'use client'
import { SetStateAction, useEffect, useState } from "react"
import ResultRenderTaskbar from "../taskbar/resultRenderTaskbar"
import { string } from "zod"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shadcn/ui/tabs"
import EditTabToolbar from "../taskbar/editTabToolbar"
import { Loader2 } from "lucide-react"
import LoadTimer from "../timer/loadTimer"



export default function ResultWrap({ slotModelName, slotMergedLines, setSlotMergedLines, setSlotResultDisplay, setSlotRaw, slotRaw, slotResultDisplay, slotTranslatedTxt, isRawOn, setIsRawOn, clipboardTxt, setClipboardTxt, setIsSlotEditShowing, setSlotEditedText, isSlotEditShowing, slotEditedText, isSlotEditing, setIsSlotEditing, isSlotResultShowing, setIsSlotResultShowing, setSlotEditErrorMsg }: {
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
    isSlotResultShowing: boolean,
    setIsSlotResultShowing: React.Dispatch<SetStateAction<boolean>>,
    setSlotEditErrorMsg:React.Dispatch<SetStateAction<string>>,

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
        console.log('editedTXT', editedLines)

        const maxLines = Math.max(rawlines.length, resultLines.length, editedLines.length)

        let mergedLines = []

        const mergedLinesArr = Array.from({ length: maxLines }).flatMap((_, i) => [
            isRawOn ? (rawlines[i] ?? { text: '', color: 'raw' }) : null,
            isSlotResultShowing ? resultLines[i] ?? { text: '', color: 'result' } : null,
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

    const [activeTab, setActiveTab] = useState('tab1')


    useEffect(() => {
        console.log('IS SLOT EDIT SHOWING:', isSlotEditShowing)
        if (!isRawOn && !isSlotEditShowing) {
            setClipboardTxt(slotTranslatedTxt)
        } else {
            const text = renderText()
            console.log('rendertext:', text)

            const clipboardTxt = text.map((line: any) => {
                if (line.color === 'result') {
                    if (!isSlotEditShowing) {
                        console.log('SLOT EDIT IS NOT SHOWING')
                        return line.text + '\n'
                    } else {
                        return line.text
                    }
                } else if (line.color === 'edit') {
                    if (isSlotEditShowing) {
                        console.log('SLOT EDIT IS SHOWING')
                        return line.text + '\n'
                    }
                } else if (line.color === 'raw') {
                    return line.text
                }
            }).join('\n')
            console.log('clipboardTxt', clipboardTxt)
            setDisplaytxt(text)
            setClipboardTxt(clipboardTxt)
            console.log('TEXT:', displayTxt)
        }

        /* console.log('clipboard', clipboardTxt) */

    }, [isSlotEditShowing, isRawOn, slotResultDisplay])

    useEffect(() => {
        console.log('isSlotEditing:', isSlotEditing)
    }, [isSlotEditing, setIsSlotEditing])



    return (
        <div className="w-full">
            <Tabs defaultValue={`tab1`} value={activeTab} onValueChange={setActiveTab} className="flex flex-col items-center">
                <div className="flex justify-between w-full max-w-[800px] gap-2 ptb">
                <TabsList className="justify-between p-0 w-auto tab-b">
                    <div className="flex gap-1">
                    <TabsTrigger value="tab1" className="p-tab shadow-none" disabled={isSlotEditing || activeTab === 'tab1'}>
                        {`Model: ${slotModelName}`}
                    </TabsTrigger>
                    {slotEditedText ? <TabsTrigger value="tab2" className="shadow-none p-tab" disabled={isSlotEditing || activeTab === 'tab2'}>
                        Edited
                    </TabsTrigger> : null}
                    </div>
                   
                </TabsList>
                <div>
                    <ResultRenderTaskbar activeTab={activeTab} setIsSlotResultShowing={setIsSlotResultShowing} isSlotResultShowing={isSlotResultShowing} setSlotMergedLines={setSlotMergedLines} slotRaw={slotRaw} slotTranslatedTxt={slotTranslatedTxt} slotResultDisplay={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn} clipboardTxt={clipboardTxt} setClipboardTxt={setClipboardTxt} setSlotDisplay={setSlotResultDisplay} setIsSlotEditShowing={setIsSlotEditShowing} setSlotEditedText={setSlotEditedText} isSlotEditShowing={isSlotEditShowing} slotEditedText={slotEditedText} isSlotEditing={isSlotEditing} setIsSlotEditing={setIsSlotEditing} setSlotEditErrorMsg={setSlotEditErrorMsg}></ResultRenderTaskbar>
                    </div>
                </div>
                    <TabsContent value="tab1" className="flex w-full justify-center mt-0">
                        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
                            {/* <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                                <h2 className="underline font-semibold text-stone-600">{`Model: ${slotModelName}`}</h2>
                                <ResultRenderTaskbar setIsSlotResultShowing={setIsSlotResultShowing} isSlotResultShowing={isSlotResultShowing} setSlotMergedLines={setSlotMergedLines} slotRaw={slotRaw} slotTranslatedTxt={slotTranslatedTxt} slotResultDisplay={slotResultDisplay} setIsRawOn={setIsRawOn} isRawOn={isRawOn} clipboardTxt={clipboardTxt} setClipboardTxt={setClipboardTxt} setSlotDisplay={setSlotResultDisplay} setIsSlotEditShowing={setIsSlotEditShowing} setSlotEditedText={setSlotEditedText} isSlotEditShowing={isSlotEditShowing} slotEditedText={slotEditedText} isSlotEditing={isSlotEditing} setIsSlotEditing={setIsSlotEditing} setSlotEditErrorMsg={setSlotEditErrorMsg}></ResultRenderTaskbar>
                            </div> */}
                            <div className="py-4 w-cont">
                                {!isSlotEditing && (isRawOn || isSlotEditShowing) ? displayTxt && displayTxt.map((line: { text: string, color: string }, idx: number) => {
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
                                }) : null}
                                {
                                    !isSlotEditing && !isRawOn && !isSlotEditShowing ?
                                        <div>
                                            {slotTranslatedTxt}
                                        </div> : null
                                }
                                {
                                    isSlotEditing ?
                                        <div className="flex gap-2 flex-col"> 
                                       
                                        <LoadTimer></LoadTimer>
                                        </div> : null
                                }
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="tab2" className="flex w-full justify-center mt-0">
                    <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
                            <div className="py-4 w-cont">
                                {slotEditedText}
                            </div>
                        </div>

                    </TabsContent>
                

            </Tabs>
        </div>

        
    )
}