'use client'
import React, { SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { TbListDetails } from "react-icons/tb";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { useClipboardContext } from "@/app/_contexts/clipboardContext";
import { toolbarIconSize } from "@/lib/toolbarIcons";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";

interface DisplayRawBtnProps {
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>
    isRawOn: boolean,
   
}

export default function DisplayRawBtn({ setIsRawOn, isRawOn }: DisplayRawBtnProps) {



    const toggleRaw = () => {
        /* console.log('[Toggle Raw] curRaw : ', curRaw)
        console.log('[Toggle Raw] curOgTxt: ', curOgTxt) */
        if (!isRawOn) {

            setIsRawOn(true)
        } else if (isRawOn) {
            /* setCurDisplay(curOgTxt) */
            setIsRawOn(false)
            
        }


    }

    return (
      
            <Button onClick={toggleRaw} variant={'ghost'} className="w-full justify-start">
                {
                    isRawOn ?
                        <div className="flex gap-2 items-center">


                            <MdOutlineVisibilityOff size={toolbarIconSize}></MdOutlineVisibilityOff>
                            <span>Hide Raw Text</span>

                        </div> :
                        <div className="flex gap-2 items-center">


                            <MdOutlineVisibility size={toolbarIconSize}></MdOutlineVisibility>
                            <span>Show Raw Text</span>

                        </div>
                }

            </Button>
       
    )
}