'use client'

import { Button } from "../ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog"
import { Label } from "../ui/label"
import { Input } from "../ui/input"
import { useRef, useState } from "react"
import { FaFileDownload } from "react-icons/fa";
import { toolbarIconSize } from "@/lib/toolbarIcons"
import { Document, Packer, Paragraph, TextRun } from "docx"
import { saveAs } from 'file-saver'

interface SaveFileDocxProps {
    clipboardTxt: string,
    slotRaw: string,
    slotTranslatedTxt: string,
    slotEditedText: string,
    isRawOn: boolean,
    isSlotEditShowing: boolean

}

export default function SaveFileDocx({ clipboardTxt, slotRaw, slotTranslatedTxt, slotEditedText, isRawOn, isSlotEditShowing }: SaveFileDocxProps) {


    const filenameInputref = useRef<HTMLInputElement>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleSaveFile = async () => {
        if (filenameInputref.current) {
            console.log('[handlesaveFile] File Name: ', filenameInputref.current.value)
            console.log('slotRaw', slotRaw)
        }


        const normalizedRaw = slotRaw.replace(/\n+/g, '\n').trim()
        const rawlines = normalizedRaw.split('\n').filter(line => line !== '　')
        const normalizedTxt = slotTranslatedTxt.replace(/\n+/g, '\n').trim()
        const resultLines = normalizedTxt.split('\n')
        const normalizedEditedTxt = slotEditedText.replace(/\n+/g, '\n').trim()
        const editedLines = normalizedEditedTxt.split('\n')

        const maxLines = Math.max(rawlines.length, resultLines.length, editedLines.length)

        let mergedLines = []


        for (let i = 0; i < maxLines; i++) {
            const line1 = rawlines[i] ?? ''
            const line2 = resultLines[i] ?? ''
            const line3 = editedLines[i] ?? ''

            if (isRawOn) {
                mergedLines.push(line1)
                if (!isSlotEditShowing) {
                    mergedLines.push(line2 + '\n')
                } else {
                    mergedLines.push(line2)
                }


            } else {

                if (isSlotEditShowing) {
                    mergedLines.push(line2)
                    mergedLines.push(line3 + '\n')
                } else {
                    mergedLines.push(line2)
                }
            }



        }

        const mergedTxt = mergedLines.join('\n')
        console.log('copyText: ', mergedTxt)

        const para = new Paragraph({
            children: mergedTxt.split('\m').flatMap((line, idx, arr) => {
                const runs = [new TextRun(line)]
                if (idx < arr.length - 1) {
                    runs.push(new TextRun({ break: 1}))
                }
                return runs
            })
        })

        const doc = new Document({
            sections: [
                {
                    children: [para]
                }
            ]
        })

        try {
            const blob = await Packer.toBlob(doc)
            if (!filenameInputref || !filenameInputref.current) {
                throw new Error('Filename is blank.')
            }
            saveAs(blob, `${filenameInputref.current.value}.docx`)
            setIsDialogOpen(false)
        } catch (err) {
            console.error('Error generating .docx file', err)
        }





    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <Button variant={'outline'} size={'icon'}>
                    <FaFileDownload size={toolbarIconSize}></FaFileDownload>
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Save document
                    </DialogTitle>
                    <DialogDescription>
                        Save the document as .docx
                    </DialogDescription>
                </DialogHeader>
                <div>
                    <Label htmlFor="docName">File Name</Label>
                    <Input ref={filenameInputref} id="docName" defaultValue={'MyDoc-1'} required>
                    </Input>
                </div>
                <DialogFooter>
                    <Button type="button" onClick={handleSaveFile}>
                        Save File
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    )
}