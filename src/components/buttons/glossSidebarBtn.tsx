'use client'

import { Button } from "../ui/button"
import { SidebarTrigger, useSidebar } from "../ui/sidebar"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { PanelLeftClose } from "lucide-react"

export default function GlossSidebarBtn () {

    const { toggleSidebar } = useSidebar()

    return (
        
        <Tooltip>
            <TooltipTrigger asChild>
            <Button size={'icon'} variant={'ghost'} onClick={toggleSidebar}>
                <PanelLeftClose></PanelLeftClose>
            </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
                <p>
                    Hide Glossary
                </p>
            </TooltipContent>
        </Tooltip>
    
        
    )
}