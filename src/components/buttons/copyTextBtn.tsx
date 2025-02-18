'use client'
import { ImCopy } from "react-icons/im";
import { Button } from "../ui/button"
import { useState } from "react";
import { IoIosCheckmarkCircleOutline } from "react-icons/io";
import { useClipboardContext } from "@/app/_contexts/clipboardContext";
import { toolbarIconSize } from "@/lib/toolbarIcons";
import { FaRegCopy } from "react-icons/fa";
import { FaRegCheckCircle } from "react-icons/fa";

interface CopyTextBtnProps {
    text: string,
    isRawOn:boolean,
    clipboardTxt:string,
    isSlotEditing:boolean

}

export default function CopyTextBtn ({text, isRawOn, clipboardTxt, isSlotEditing}: CopyTextBtnProps) {

    const [isCopied, setIsCopied] = useState(false)
    

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(clipboardTxt)
                setIsCopied(true)
                setTimeout(() => setIsCopied(false), 2000)
            

        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }



    return (
        
            <Button onClick={handleCopy} disabled={isCopied || isSlotEditing} className={`disabled:opacity-100 ${isCopied ? 'bg-green-400' : null} min-w-[128px]`} variant={'outline'}>
                {
                    isCopied ?
                    <div className="flex items-center gap-2">
                    <FaRegCheckCircle size={toolbarIconSize}>
                    </FaRegCheckCircle>
                    <span>Copied!</span>
                    </div> : 
                    <div className="flex items-center gap-2">
                    <FaRegCopy size={toolbarIconSize}>
                        
                    </FaRegCopy>
                    <span>
                        Copy Text
                    </span>
                    </div>

                }
            </Button>
        
    )
}