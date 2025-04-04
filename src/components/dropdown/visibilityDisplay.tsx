'use client'

import { SetStateAction, useState } from "react"
import { toolbarIconSize } from "@/lib/toolbarIcons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger, DropdownMenuGroup, DropdownMenuItem } from "../ui/dropdown-menu"
import { Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip"
import { Button } from "../ui/button"
import { MdOutlineVisibility } from "react-icons/md"
import DisplayEditedTxtBtn from "../buttons/displayEditTxtBtn"
import DisplayRawBtn from "../buttons/displayRawBtn"

interface VisibilityDropDownProps {
    isSlotEditing: boolean,
    isRawOn: boolean,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>,
    isSlotEditShowing:boolean,
    slotEditedText:string

}


export default function VisibilityDropDown({
    isSlotEditing,
    isRawOn,
    setIsRawOn,
    setIsSlotEditShowing,
    isSlotEditShowing,
    slotEditedText
}:VisibilityDropDownProps) {

    const [isTooltipAllowed, setIsTooltipAllowed] = useState(false)


    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger onPointerEnter={() => setIsTooltipAllowed(true)} onPointerLeave={() => setIsTooltipAllowed(false)} asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant={'outline'} disabled={isSlotEditing} size={'icon'}>
                            <MdOutlineVisibility size={toolbarIconSize}></MdOutlineVisibility>
                        </Button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                {isTooltipAllowed ? <TooltipContent>
                    <p>Visibility</p>
                </TooltipContent> : null}
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <DisplayRawBtn setIsRawOn={setIsRawOn} isRawOn={isRawOn}></DisplayRawBtn>
                        </DropdownMenuItem>
                        {
                            slotEditedText ?
                                <DropdownMenuItem>
                                    <DisplayEditedTxtBtn setIsSlotEditShowing={setIsSlotEditShowing} isSlotEditShowing={isSlotEditShowing}></DisplayEditedTxtBtn>
                                </DropdownMenuItem>
                                : null
                        }
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </Tooltip>
        </DropdownMenu>
    )
}