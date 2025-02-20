import DisplayRawBtn from "../buttons/displayRawBtn"
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"
import EditTextBtn from "../buttons/editTextBtn"
import DisplayEditedTxtBtn from "../buttons/displayEditTxtBtn"
import { Separator } from "../ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu"
import { Button } from "../ui/button"
import { MdOutlineVisibility } from "react-icons/md";
import { MdOutlineVisibilityOff } from "react-icons/md";
import { FaFileDownload } from "react-icons/fa";
import SaveFileDocx from "../buttons/saveToDocx"
import DisplayResultBtn from "../buttons/displayResultBtn"
import { toolbarIconSize } from "@/lib/toolbarIcons"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import VisibilityDropDown from "../dropdown/visibilityDisplay"

interface ResultRenderTaskbarProps {
    slotRaw: string,
    slotTranslatedTxt: string,  //translated txt used for processing. eg in raw toggle
    slotResultDisplay: string, //translated text for display
    isRawOn: boolean,
    setIsRawOn: React.Dispatch<SetStateAction<boolean>>,
    setSlotMergedLines: React.Dispatch<SetStateAction<string[]>>,
    clipboardTxt: string,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>,
    setSlotDisplay: React.Dispatch<SetStateAction<string>>,

    slotEditedText: string,
    setSlotEditedText: React.Dispatch<SetStateAction<string>>,

    isSlotEditShowing: boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>,

    isSlotEditing:boolean,
    setIsSlotEditing:React.Dispatch<SetStateAction<boolean>>,

    isSlotResultShowing:boolean,
    setIsSlotResultShowing:React.Dispatch<SetStateAction<boolean>>,
}

export default function ResultRenderTaskbar({ setSlotMergedLines, slotRaw, slotTranslatedTxt, setIsRawOn, isRawOn, slotResultDisplay, clipboardTxt, setClipboardTxt, setSlotDisplay, setSlotEditedText, slotEditedText, isSlotEditShowing, setIsSlotEditShowing, isSlotEditing, isSlotResultShowing, setIsSlotResultShowing, setIsSlotEditing }: ResultRenderTaskbarProps) {


    return (
        <div className="flex gap-2 shadow-md rounded-sm p-2 border-1 border">
            <div>
            <CopyTextBtn isRawOn={isRawOn} text={slotResultDisplay} clipboardTxt={clipboardTxt} isSlotEditing={isSlotEditing}></CopyTextBtn>
            </div>
            <div className="flex gap-2">
                <SaveFileDocx clipboardTxt={clipboardTxt} slotEditedText={slotEditedText} slotTranslatedTxt={slotTranslatedTxt} isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} slotRaw={slotRaw} isSlotEditing={isSlotEditing}></SaveFileDocx>
                <EditTextBtn slotRaw={slotRaw} slotTxt={slotResultDisplay} setSlotDisplay={setSlotDisplay} setSlotEditedText={setSlotEditedText} setIsSlotEditing={setIsSlotEditing} isSlotEditing={isSlotEditing} setIsSlotEditShowing={setIsSlotEditShowing}></EditTextBtn>
                <VisibilityDropDown isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} isSlotEditing={isSlotEditing} setIsRawOn={setIsRawOn} setIsSlotEditShowing={setIsSlotEditShowing} slotEditedText={slotEditedText}></VisibilityDropDown>
               
                
            </div>

           




        </div>
    )
}