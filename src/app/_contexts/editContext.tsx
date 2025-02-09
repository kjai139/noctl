'use client'
import React, { createContext, SetStateAction, useContext, useState } from "react";





interface editTabContexType {
    slot1EditedText: string,
    slot2EditedText: string,
    setSlot1EditedTxt: React.Dispatch<SetStateAction<string>>
    setSlot2EditedTxt: React.Dispatch<SetStateAction<string>>
    isSlot1EditShowing: boolean,
    setIsSlot1EditShowing: React.Dispatch<SetStateAction<boolean>>
    isSlot2EditShowing: boolean,
    setIsSlot2EditShowing: React.Dispatch<SetStateAction<boolean>>
}


const editTabContext = createContext<editTabContexType | undefined>(undefined)


export default function EditedTabProvider ({children}:{children: React.ReactNode}) {
    const [slot1EditedText, setSlot1EditedTxt] = useState('')
    const [slot2EditedText, setSlot2EditedTxt] = useState('')
    const [isSlot1EditShowing, setIsSlot1EditShowing] = useState(false)
    const [isSlot2EditShowing, setIsSlot2EditShowing] = useState(false)

    return (
        <editTabContext.Provider value={{slot1EditedText, slot2EditedText, setSlot1EditedTxt, setSlot2EditedTxt, isSlot1EditShowing, isSlot2EditShowing, setIsSlot1EditShowing, setIsSlot2EditShowing}}>
            {children}
        </editTabContext.Provider>
    )
}

export function useEditTabContext() {
    const context = useContext(editTabContext)

    if (!context) {
        throw new Error('useEditTabContext must be used within EditTabProvider')
    }

    return context
}