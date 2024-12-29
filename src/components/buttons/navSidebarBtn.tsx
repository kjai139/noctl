'use client'

import { SidebarTrigger, useSidebar } from "../ui/sidebar"


export default function NavsideBarButton () {
    const { state } = useSidebar()

    if (state === 'collapsed') {
        return (
            <SidebarTrigger>

            </SidebarTrigger>
        )
    } else if (state === 'expanded') {
        return null
    }

}