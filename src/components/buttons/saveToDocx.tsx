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
    isSlotEditing:boolean

}

export default function SaveFileDocx({ clipboardTxt, slotRaw, slotTranslatedTxt, slotEditedText, isRawOn, isSlotEditShowing, isSlotEditing }: SaveFileDocxProps) {


    const filenameInputref = useRef<HTMLInputElement>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleSaveFile = async () => {
        if (filenameInputref.current) {
            console.log('[handlesaveFile] File Name: ', filenameInputref.current.value)
        }
    
        const docArr = clipboardTxt.split('\n')
        console.log('[saveFileBtn] docArr', docArr)
    
        const para = new Paragraph({
            children: docArr.flatMap((line) => {
                if (line === '') {
                    return [new TextRun({break: 1})]
                } else {
                    return [new TextRun(line), new TextRun({break: 1})]

                }
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
                <Button variant={'outline'} size={'icon'} disabled={isSlotEditing}>
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