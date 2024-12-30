import GlossaryTable from "../tables/glossaryTable";
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter, SidebarTrigger } from "../ui/sidebar";



export default function AppSidebar () {

    return (
        <Sidebar>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="items-center justify-between">
                        Glossary tab
                        
                        <SidebarTrigger></SidebarTrigger>
                       
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <GlossaryTable>

                        </GlossaryTable>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
            <SidebarFooter>

            </SidebarFooter>
        </Sidebar>
    )
}