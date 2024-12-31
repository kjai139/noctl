'use client'

import { SidebarTrigger } from "../ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

export default function GlossSidebarBtn () {

    return (
        <Tooltip>
            <TooltipTrigger asChild>
            <SidebarTrigger></SidebarTrigger>
            </TooltipTrigger>
            <TooltipContent side="right">
                <p>
                    Hide Glossary
                </p>
            </TooltipContent>
        </Tooltip>
        
    )
}