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

interface ResultRenderTaskbarProps {
    curRaw: string, // untranslated raw txt
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

    isSlotEditShowing:boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>,
}

export default function ResultRenderTaskbar ({setSlotMergedLines, curRaw, slotTranslatedTxt, setIsRawOn, isRawOn, slotResultDisplay, clipboardTxt, setClipboardTxt, setSlotDisplay, setSlotEditedText, slotEditedText, isSlotEditShowing, setIsSlotEditShowing}:ResultRenderTaskbarProps) {

    return (
        <div className="flex gap-2 shadow-md rounded-sm p-2 border-1 border">
            
            <div className="flex gap-2">
            <EditTextBtn slotRaw={curRaw} slotTxt={slotResultDisplay} setSlotDisplay={setSlotDisplay} setSlotEditedText={setSlotEditedText}></EditTextBtn>
            <CopyTextBtn isRawOn={isRawOn} text={slotResultDisplay} clipboardTxt={clipboardTxt}></CopyTextBtn>
            </div>
            
            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={'outline'}>
                            Visibility
                        </Button>
                    </DropdownMenuTrigger>
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
                </DropdownMenu>
            
            
            </div>
        
        
        

        </div>
    )
}