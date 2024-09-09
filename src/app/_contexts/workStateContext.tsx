'use client'

import { createContext, useContext, useState } from "react"
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
}




const workStateContext = createContext<workStateContextType | undefined>(undefined)


export function WorkStateProvider ({children}: {children: React.ReactNode}) {

    const [glossary, setGlossary] = useState<GlossaryItem[]>([])
    const [user, setUser] = useState<UserState | null>(null)
    const [curResult, setCurResult] = useState('')
    const [unsure, setUnsure] = useState<UnsureItem[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [chunks, setChunks] = useState<string[]>([])


    return (
        <workStateContext.Provider value={{glossary, setGlossary, user, setUser, curResult, setCurResult, unsure, setUnsure, isLoading, setIsLoading, chunks, setChunks}}>
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