import React, { SetStateAction } from "react";
import { Button } from "../ui/button";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { toolbarIconSize } from "@/lib/toolbarIcons";

interface DisplayResultBtnProps {
    isSlotResultShowing: boolean,
    setIsSlotResultShowing: React.Dispatch<SetStateAction<boolean>>
}



export default function DisplayResultBtn({ isSlotResultShowing, setIsSlotResultShowing }: DisplayResultBtnProps) {


    const toggleEditDisplay = () => {
        if (isSlotResultShowing) {
            setIsSlotResultShowing(false)
        } else if (!isSlotResultShowing) {
            setIsSlotResultShowing(true)
        }
    }


    return (
        <Button onClick={toggleEditDisplay} variant={'ghost'} className="w-full">
            {
                isSlotResultShowing ?
                    <div className="flex gap-2 items-center">


                        <MdOutlineVisibilityOff size={toolbarIconSize}></MdOutlineVisibilityOff>
                        <span>Hide Original Translation</span>

                    </div> :
                    <div className="flex gap-2 items-center">


                        <MdOutlineVisibility size={toolbarIconSize}></MdOutlineVisibility>
                        <span>Show Original Translation</span>

                    </div> 
            }
        </Button>
    )
}