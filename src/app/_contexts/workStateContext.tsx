'use client'

import { createContext, useContext, useState } from "react"


interface GlossaryItem {
    term:string,
    translation:string
}

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
}




const workStateContext = createContext<workStateContextType | undefined>(undefined)


export function WorkStateProvider ({children}: {children: React.ReactNode}) {

    const [glossary, setGlossary] = useState<GlossaryItem[]>([])
    const [user, setUser] = useState<UserState | null>(null)
    const [curResult, setCurResult] = useState('')
    const [unsure, setUnsure] = useState<UnsureItem[]>([])


    return (
        <workStateContext.Provider value={{glossary, setGlossary, user, setUser, curResult, setCurResult, unsure, setUnsure}}>
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