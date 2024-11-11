'use client'

import React, { createContext, SetStateAction, useContext, useState } from "react"
import { GlossaryItem } from "../_types/glossaryType"

interface UnsureItem {
    line: string,
    translation: string,
    certainty: string
    
}

interface UserState {
    id:string,
    name:string,
}


interface workStateContextType {
    glossary: GlossaryItem[];
    setGlossary: React.Dispatch<React.SetStateAction<GlossaryItem[]>>;
    user: UserState | null;
    setUser: React.Dispatch<React.SetStateAction<UserState | null>>;
    //curResult > slot1resultdisplay
    slot1ResultDisplay: string,
    setSlot1ResultDisplay: React.Dispatch<React.SetStateAction<string>>;

    //curRaw > slot1Raw
    slot1Raw:string,
    setSlot1Raw: React.Dispatch<React.SetStateAction<string>>;

    //ogCurresult >  slo1Txt
    slot1Txt: string,
    setSlot1Txt:React.Dispatch<React.SetStateAction<string>>;

    slot1ModelName:string,
    setSlot1ModelName:React.Dispatch<React.SetStateAction<string>>;

    slot1Error:string,
    setSlot1Error: React.Dispatch<React.SetStateAction<string>>;

    //slot2 alt 
    slot2ResultDisplay: string,
    setSlot2ResultDisplay: React.Dispatch<React.SetStateAction<string>>;

    slot2Raw:string,
    setSlot2Raw: React.Dispatch<React.SetStateAction<string>>;

    slot2Txt: string,
    setSlot2Txt:React.Dispatch<React.SetStateAction<string>>;

    slot2ModelName:string,
    setSlot2ModelName:React.Dispatch<React.SetStateAction<string>>;
    
    slot2Error:string,
    setSlot2Error: React.Dispatch<React.SetStateAction<string>>;

    //other

    unsure: UnsureItem[];
    setUnsure: React.Dispatch<React.SetStateAction<UnsureItem[]>>;
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    chunks: string[],
    setChunks:React.Dispatch<React.SetStateAction<string[]>>;
    
    
    userCurrency: number | null,
    setUserCurrency: React.Dispatch<React.SetStateAction<number | null>>,
    standardResultError: string,
    setStandardResultError: React.Dispatch<SetStateAction<string>>,
    better1Error: string,
    setBetter1Error: React.Dispatch<SetStateAction<string>>,
}




const workStateContext = createContext<workStateContextType | undefined>(undefined)


export function WorkStateProvider ({children}: {children: React.ReactNode}) {

    const [glossary, setGlossary] = useState<GlossaryItem[]>([])
    const [user, setUser] = useState<UserState | null>(null)

    //result states
    const [slot1ResultDisplay, setSlot1ResultDisplay] = useState('')
    const [slot1Raw, setSlot1Raw] = useState('')
    const [slot1Txt, setSlot1Txt] = useState('')
    const [slot1Error, setSlot1Error] = useState('')

    const [slot2ResultDisplay, setSlot2ResultDisplay] = useState('')
    const [slot2Raw, setSlot2Raw] = useState('')
    const [slot2Txt, setSlot2Txt] = useState('')
    const [slot2Error, setSlot2Error] = useState('')

    const [slot1ModelName, setSlot1ModelName] = useState('')
    const [slot2ModelName, setSlot2ModelName] = useState('')


    const [unsure, setUnsure] = useState<UnsureItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [chunks, setChunks] = useState<string[]>([])
    
    const [standardResultError, setStandardResultError] = useState('')
    const [better1Error, setBetter1Error] = useState('')

    const [userCurrency, setUserCurrency] = useState<number | null>(null)


    return (
        <workStateContext.Provider value={{glossary, setGlossary, user, setUser, slot1ResultDisplay, setSlot1ResultDisplay, slot1Txt, setSlot1Txt, unsure, setUnsure, isLoading, setIsLoading, chunks, setChunks, setSlot2ResultDisplay, slot2ResultDisplay, slot1Raw, setSlot1Raw, slot2Txt, setSlot2Txt, slot2Raw, setSlot2Raw, userCurrency, setUserCurrency, better1Error, setBetter1Error, standardResultError, setStandardResultError, setSlot1ModelName, slot1ModelName, setSlot2ModelName, slot2ModelName, setSlot1Error, slot1Error, setSlot2Error, slot2Error}}>
            {children}
        </workStateContext.Provider>
    )
}

export function useWorkState() {
    const context = useContext(workStateContext)

    if (!context) {
        throw new Error('useWorkContext must be used within workStateProvider')
    }

    return context
}