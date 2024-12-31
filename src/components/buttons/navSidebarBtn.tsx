'use client'

import { SidebarTrigger, useSidebar } from "../ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"


export default function NavsideBarButton() {
    const { state } = useSidebar()

    if (state === 'collapsed') {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <SidebarTrigger>

                    </SidebarTrigger>

                </TooltipTrigger>
                <TooltipContent>
                    <p>Open Glossary</p>
                </TooltipContent>

            </Tooltip>
        )
    } else if (state === 'expanded') {
        return null
    }

}