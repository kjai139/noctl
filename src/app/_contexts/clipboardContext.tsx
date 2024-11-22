'use client'
import React, { createContext, SetStateAction, useContext, useState } from "react";




interface clipboardContexType {
    clipboardTxt: LanguagesType,
    setClipboardTxt: React.Dispatch<SetStateAction<string>>
}


const clipboardContext = createContext<clipboardContexType | undefined>(undefined)


export default function ClipboardeProvider ({children}:{children: React.ReactNode}) {
    const [clipboardTxt, setClipboardTxt] = useState('')

    return (
        <clipboardContext.Provider value={{clipboardTxt, setClipboardTxt}}>
            {children}
        </clipboardContext.Provider>
    )
}

export function useClipboardContext() {
    const context = useContext(clipboardContext)

    if (!context) {
        throw new Error('useOutputContext must be used within ClipboardProvider')
    }

    return context
}