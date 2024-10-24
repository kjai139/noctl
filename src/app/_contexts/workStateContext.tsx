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
    curResult: string,
    setCurResult: React.Dispatch<React.SetStateAction<string>>;
    unsure: UnsureItem[];
    setUnsure: React.Dispatch<React.SetStateAction<UnsureItem[]>>;
    isLoading: boolean,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
    chunks: string[],
    setChunks:React.Dispatch<React.SetStateAction<string[]>>;
    altResult1: string,
    setAltResult1: React.Dispatch<React.SetStateAction<string>>;
    curRaw:string,
    setCurRaw: React.Dispatch<React.SetStateAction<string>>;
    ogAltResult:string,
    setOgAltResult:React.Dispatch<React.SetStateAction<string>>;
    ogCurResult: string,
    setOgCurResult:React.Dispatch<React.SetStateAction<string>>;
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
    const [curResult, setCurResult] = useState('')
    const [unsure, setUnsure] = useState<UnsureItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [chunks, setChunks] = useState<string[]>([])
    const [altResult1, setAltResult1] = useState('')
    const [curRaw, setCurRaw] = useState('')

    const [ogAltResult, setOgAltResult] = useState('')
    const [ogCurResult, setOgCurResult] = useState('')
    const [standardResultError, setStandardResultError] = useState('')
    const [better1Error, setBetter1Error] = useState('')

    const [userCurrency, setUserCurrency] = useState<number | null>(null)


    return (
        <workStateContext.Provider value={{glossary, setGlossary, user, setUser, curResult, setCurResult, unsure, setUnsure, isLoading, setIsLoading, chunks, setChunks, altResult1, setAltResult1, curRaw, setCurRaw, ogAltResult, setOgAltResult, setOgCurResult, ogCurResult, userCurrency, setUserCurrency, better1Error, setBetter1Error, standardResultError, setStandardResultError}}>
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