'use client'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { WorkStateProvider } from "./_contexts/workStateContext"

export function Providers ({children}:{children: React.ReactNode}) {

    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <WorkStateProvider>
            {children}
            </WorkStateProvider>
        </NextThemesProvider>
    )
}