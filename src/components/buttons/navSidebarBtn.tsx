'use client'

import { Button } from "../ui/button";
import { SidebarTrigger, useSidebar } from "../ui/sidebar"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { useIsMobile } from "@/hooks/use-mobile"
import { AiOutlineMenuUnfold } from "react-icons/ai";

export default function NavsideBarButton() {
    const { state, toggleSidebar } = useSidebar()
    const  isMobile  = useIsMobile()

    if (state === 'collapsed' && !isMobile) {
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
    } else if (state === 'expanded' && !isMobile) {
        return null
    } else if (isMobile) {
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <Button size={'icon'} variant={'ghost'} onClick={toggleSidebar}>
                        <AiOutlineMenuUnfold size={30}></AiOutlineMenuUnfold>
                    </Button>

                </TooltipTrigger>
                <TooltipContent>
                    <p>Open Glossary</p>
                </TooltipContent>

            </Tooltip>
        )
    }

}