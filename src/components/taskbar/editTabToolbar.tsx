
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"
import SaveFileDocx from "../buttons/saveToDocx"
import VisibilityDropDown from "../dropdown/visibilityDisplay"
import CheckQualityBtn from "../buttons/checkQuality"

interface EditTabToolbarProps {
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

    setSlotEditErrorMsg: React.Dispatch<SetStateAction<string>>,
}

export default function EditTabToolbar({ setSlotMergedLines, slotRaw, slotTranslatedTxt, setIsRawOn, isRawOn, slotResultDisplay, clipboardTxt, setClipboardTxt, setSlotDisplay, setSlotEditedText, slotEditedText, isSlotEditShowing, setIsSlotEditShowing, isSlotEditing, isSlotResultShowing, setIsSlotResultShowing, setIsSlotEditing, setSlotEditErrorMsg }: EditTabToolbarProps) {


    return (
        <div className="flex gap-2 shadow-md rounded-sm p-2 border-1 border">
            <div>
            <CopyTextBtn isRawOn={isRawOn} text={slotResultDisplay} clipboardTxt={clipboardTxt} isSlotEditing={isSlotEditing}></CopyTextBtn>
            </div>
            <div className="flex gap-2">
                <SaveFileDocx clipboardTxt={clipboardTxt} slotEditedText={slotEditedText} slotTranslatedTxt={slotTranslatedTxt} isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} slotRaw={slotRaw} isSlotEditing={isSlotEditing}></SaveFileDocx>
               
            </div>

           




        </div>
    )
}