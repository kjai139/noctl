import React, { SetStateAction } from "react";
import { Button } from "../ui/button";
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { toolbarIconSize } from "@/lib/toolbarIcons";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

interface DisplayEditedTxtBtnProps {
    isSlotEditShowing: boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>
}



export default function DisplayEditedTxtBtn({ isSlotEditShowing, setIsSlotEditShowing }: DisplayEditedTxtBtnProps) {


    const toggleEditDisplay = () => {
        if (isSlotEditShowing) {
            setIsSlotEditShowing(false)
        } else if (!isSlotEditShowing) {
            setIsSlotEditShowing(true)
        }
    }


    return (
        
        <Button onClick={toggleEditDisplay} variant={'ghost'} className="w-full">
            {
                isSlotEditShowing ?
                    <div className="flex gap-2 items-center">


                        <MdOutlineVisibilityOff size={toolbarIconSize}></MdOutlineVisibilityOff>
                        <span>Hide Edited Text</span>

                    </div> :
                    <div className="flex gap-2 items-center">


                        <MdOutlineVisibility size={toolbarIconSize}></MdOutlineVisibility>
                        <span>Show Edited Text</span>

                    </div> 
            }
        </Button>
       
    )
}