'use client'
import { ImCopy } from "react-icons/im";
import { Button } from "../ui/button"
import { useState } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useClipboardContext } from "@/app/_contexts/clipboardContext";
import { toolbarIconSize } from "@/lib/toolbarIcons";

interface CopyTextBtnProps {
    text: string,
    isRawOn:boolean,
    clipboardTxt:string,

}

export default function CopyTextBtn ({text, isRawOn, clipboardTxt}: CopyTextBtnProps) {

    const [isCopied, setIsCopied] = useState(false)
    

    const handleCopy = async () => {
        try {
            if (isRawOn) {
                console.log('[CopyTextBtn] Clipboardtxt - ', clipboardTxt)
                await navigator.clipboard.writeText(clipboardTxt)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            } else {
                await navigator.clipboard.writeText(text)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            }
            

        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }



    return (
        <div>
            <Button onClick={handleCopy} disabled={isCopied} className="disabled:opacity-100" variant={'secondary'}>
                {
                    isCopied ?
                    <div className="flex items-center gap-2">
                    <IoIosCheckmarkCircleOutline></IoIosCheckmarkCircleOutline>
                    <span>Copied!</span>
                    </div> : 
                    <div className="flex items-center gap-2">
                    <ImCopy size={toolbarIconSize}></ImCopy>
                    <span>Copy</span>
                    </div>

                }
            </Button>
        </div>
    )
}