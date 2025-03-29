import GlossSidebarBtn from "../buttons/glossSidebarBtn";
import GlossaryInfoDialog from "../dialog/glossaryInfoDialog";
import GlossaryTable from "../tables/glossaryTable";
import { Sidebar, SidebarHeader, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter, SidebarTrigger } from "../ui/sidebar";



export default function AppSidebar () {

    return (
        <Sidebar>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="items-center justify-between pl-0">
                        <div className="flex gap-1 items-center">
                                        <h1 className="pl-2 tracking-wide font-semibold">Translation Glossary</h1>
                                        <GlossaryInfoDialog></GlossaryInfoDialog>
                        </div>
                        <GlossSidebarBtn></GlossSidebarBtn>
                        
                       
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