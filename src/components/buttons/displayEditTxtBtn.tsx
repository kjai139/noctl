import React, { SetStateAction } from "react";
import { Button } from "../ui/button";


interface DisplayEditedTxtBtnProps {
    isSlotEditShowing: boolean,
    setIsSlotEditShowing: React.Dispatch<SetStateAction<boolean>>
}



export default function DisplayEditedTxtBtn ({isSlotEditShowing, setIsSlotEditShowing}:DisplayEditedTxtBtnProps) {


    const toggleEditDisplay = () => {
        if (isSlotEditShowing) {
            setIsSlotEditShowing(false)
        } else if (!isSlotEditShowing) {
            setIsSlotEditShowing(true)
        }
    }


    return (
        <Button onClick={toggleEditDisplay}>
            Show Edit
        </Button>
    )
}