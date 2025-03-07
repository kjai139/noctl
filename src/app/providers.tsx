'use client'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { WorkStateProvider } from "./_contexts/workStateContext"

import OutputLanguageProvider from "./_contexts/outputContext"
import { SessionProvider } from "next-auth/react"
import ClipboardeProvider from "./_contexts/clipboardContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import EditedTabProvider from "./_contexts/editContext"

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <SessionProvider>
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            
                <WorkStateProvider>
                    <ClipboardeProvider>
                        <EditedTabProvider>
                        <TooltipProvider>
                        
                            <OutputLanguageProvider>
                            <SidebarProvider>
                                {children}
                                </SidebarProvider>
                            </OutputLanguageProvider>
                        
                        </TooltipProvider>
                        </EditedTabProvider>
                    </ClipboardeProvider>
                </WorkStateProvider>
            
        </NextThemesProvider>
        </SessionProvider>
    )
}