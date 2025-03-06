
import CopyTextBtn from "../buttons/copyTextBtn"
import { SetStateAction } from "react"
import SaveFileDocx from "../buttons/saveToDocx"
import VisibilityDropDown from "../dropdown/visibilityDisplay"
import CheckQualityBtn from "../buttons/checkQuality"

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

    setSlotEditErrorMsg: React.Dispatch<SetStateAction<string>>,
    activeTab: string
}

export default function ResultRenderTaskbar({ setSlotMergedLines, slotRaw, slotTranslatedTxt, setIsRawOn, isRawOn, slotResultDisplay, clipboardTxt, setClipboardTxt, setSlotDisplay, setSlotEditedText, slotEditedText, isSlotEditShowing, setIsSlotEditShowing, isSlotEditing, isSlotResultShowing, setIsSlotResultShowing, setIsSlotEditing, setSlotEditErrorMsg, activeTab }: ResultRenderTaskbarProps) {


    return (
        <div className="flex gap-2 relative top-[-.5rem]">
           
            {activeTab === 'tab1' ? <div className="flex gap-2">
                <CopyTextBtn isRawOn={isRawOn} text={slotResultDisplay} clipboardTxt={clipboardTxt} isSlotEditing={isSlotEditing} slotEditedText={slotEditedText} mode={'direct'}></CopyTextBtn>
                <SaveFileDocx clipboardTxt={clipboardTxt} slotEditedText={slotEditedText} slotTranslatedTxt={slotTranslatedTxt} isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} slotRaw={slotRaw} isSlotEditing={isSlotEditing}></SaveFileDocx>
                <CheckQualityBtn slotRaw={slotRaw} slotTxt={slotResultDisplay} setSlotDisplay={setSlotDisplay} setSlotEditedText={setSlotEditedText} setIsSlotEditing={setIsSlotEditing} isSlotEditing={isSlotEditing} setIsSlotEditShowing={setIsSlotEditShowing} setSlotEditErrorMsg={setSlotEditErrorMsg}></CheckQualityBtn>
                <VisibilityDropDown isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} isSlotEditing={isSlotEditing} setIsRawOn={setIsRawOn} setIsSlotEditShowing={setIsSlotEditShowing} slotEditedText={slotEditedText}></VisibilityDropDown>
               
                
            </div>:
            <div className="flex gap-2">
                <CopyTextBtn isRawOn={isRawOn} mode={'edited'} text={slotResultDisplay} clipboardTxt={clipboardTxt} isSlotEditing={isSlotEditing} slotEditedText={slotEditedText}></CopyTextBtn>
               <SaveFileDocx clipboardTxt={clipboardTxt} slotEditedText={slotEditedText} slotTranslatedTxt={slotTranslatedTxt} isRawOn={isRawOn} isSlotEditShowing={isSlotEditShowing} slotRaw={slotRaw} isSlotEditing={isSlotEditing} mode={'edit'}></SaveFileDocx>
            </div>
            }

           




        </div>
    )
}