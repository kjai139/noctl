'use client'
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { WorkStateProvider } from "./_contexts/workStateContext"
import { SidebarProvider } from "@/components/ui/sidebar"
import OutputLanguageProvider from "./_contexts/outputContext"
import { SessionProvider } from "next-auth/react"
import ClipboardeProvider from "./_contexts/clipboardContext"

export function Providers({ children }: { children: React.ReactNode }) {

    return (
        <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <SessionProvider>
                <WorkStateProvider>
                    <ClipboardeProvider>
                        <SidebarProvider>
                            <OutputLanguageProvider>
                                {children}
                            </OutputLanguageProvider>
                        </SidebarProvider>
                    </ClipboardeProvider>
                </WorkStateProvider>
            </SessionProvider>
        </NextThemesProvider>
    )
}