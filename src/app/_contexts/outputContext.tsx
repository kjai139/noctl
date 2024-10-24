'use client'
import React, { createContext, SetStateAction, useContext, useState } from "react";
import { LanguagesType } from "../_types/glossaryType";



interface outputContexType {
    outputLang: LanguagesType,
    setOutputLang: React.Dispatch<SetStateAction<LanguagesType>>
}


const outputContext = createContext<outputContexType | undefined>(undefined)


export default function OutputLanguageProvider ({children}:{children: React.ReactNode}) {
    const [outputLang, setOutputLang] = useState<LanguagesType>('English')

    return (
        <outputContext.Provider value={{outputLang, setOutputLang}}>
            {children}
        </outputContext.Provider>
    )
}

export function useOutputContext() {
    const context = useContext(outputContext)

    if (!context) {
        throw new Error('useOutputContext must be used within OutputLanguageProvider')
    }

    return context
}