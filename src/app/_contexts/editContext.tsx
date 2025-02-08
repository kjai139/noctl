'use client'
import React, { createContext, SetStateAction, useContext, useState } from "react";





interface editTabContexType {
    slot1EditedText: string,
    slot2EditedText: string,
    setSlot1EditedTxt: React.Dispatch<SetStateAction<string>>
    setSlot2EditedTxt: React.Dispatch<SetStateAction<string>>
}


const editTabContext = createContext<editTabContexType | undefined>(undefined)


export default function EditedTabProvider ({children}:{children: React.ReactNode}) {
    const [slot1EditedText, setSlot1EditedTxt] = useState('')
    const [slot2EditedText, setSlot2EditedTxt] = useState('')

    return (
        <editTabContext.Provider value={{slot1EditedText, slot2EditedText, setSlot1EditedTxt, setSlot2EditedTxt}}>
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