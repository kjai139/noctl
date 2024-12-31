'use client'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { WorkStateProvider } from "./_contexts/workStateContext"

import OutputLanguageProvider from "./_contexts/outputContext"
import { SessionProvider } from "next-auth/react"
import ClipboardeProvider from "./_contexts/clipboardContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProvider>
                <WorkStateProvider>
                    <ClipboardeProvider>
                        <TooltipProvider>
                        <SidebarProvider>
                            <OutputLanguageProvider>
                                {children}
                            </OutputLanguageProvider>
                        </SidebarProvider>
                        </TooltipProvider>
                    </ClipboardeProvider>
                </WorkStateProvider>
            </SessionProvider>
        </NextThemesProvider>
    )
}