'use client'
import React, { createContext, SetStateAction, useContext, useState } from "react";





interface clipboardContexType {
    clipboard1Txt: string,
    clipboard2Txt: string,
    setClipboard1Txt: React.Dispatch<SetStateAction<string>>
    setClipboard2Txt: React.Dispatch<SetStateAction<string>>
}


const clipboardContext = createContext<clipboardContexType | undefined>(undefined)


export default function ClipboardeProvider ({children}:{children: React.ReactNode}) {
    const [clipboard1Txt, setClipboard1Txt] = useState('')
    const [clipboard2Txt, setClipboard2Txt] = useState('')

    return (
        <clipboardContext.Provider value={{clipboard1Txt, setClipboard1Txt, clipboard2Txt, setClipboard2Txt}}>
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