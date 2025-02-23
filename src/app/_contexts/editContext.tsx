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
    isSlot1Editing: boolean,
    isSlot2Editing: boolean,
    setIsSlot1Editing: React.Dispatch<SetStateAction<boolean>>
    setIsSlot2Editing:React.Dispatch<SetStateAction<boolean>>
    isSlot1ResultShowing:boolean,
    isSlot2ResultShowing:boolean,
    setIsSlot1ResultShowing: React.Dispatch<SetStateAction<boolean>>,
    setIsSlot2ResultShowing: React.Dispatch<SetStateAction<boolean>>
    slot1EditErrorMsg: string,
    slot2EditErrorMsg: string,
    setSlot1EditErrorMsg: React.Dispatch<SetStateAction<string>>,
    setSlot2EditErrorMsg: React.Dispatch<SetStateAction<string>>
    
}


const editTabContext = createContext<editTabContexType | undefined>(undefined)


export default function EditedTabProvider ({children}:{children: React.ReactNode}) {
    const [slot1EditedText, setSlot1EditedTxt] = useState('')
    const [slot2EditedText, setSlot2EditedTxt] = useState('')
    const [isSlot1EditShowing, setIsSlot1EditShowing] = useState(false)
    const [isSlot2EditShowing, setIsSlot2EditShowing] = useState(false)
    const [isSlot1Editing, setIsSlot1Editing] = useState(false)
    const [isSlot2Editing, setIsSlot2Editing] = useState(false)
    const [isSlot1ResultShowing, setIsSlot1ResultShowing] = useState(true)
    const [isSlot2ResultShowing, setIsSlot2ResultShowing] = useState(true)
    const [slot1EditErrorMsg, setSlot1EditErrorMsg] = useState('')
    const [slot2EditErrorMsg, setSlot2EditErrorMsg] = useState('')

    return (
        <editTabContext.Provider value={{slot1EditedText, slot2EditedText, setSlot1EditedTxt, setSlot2EditedTxt, isSlot1EditShowing, isSlot2EditShowing, setIsSlot1EditShowing, setIsSlot2EditShowing, isSlot1Editing, isSlot2Editing, setIsSlot1Editing, setIsSlot2Editing, isSlot1ResultShowing, isSlot2ResultShowing, setIsSlot1ResultShowing, setIsSlot2ResultShowing, slot1EditErrorMsg, slot2EditErrorMsg, setSlot1EditErrorMsg, setSlot2EditErrorMsg}}>
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