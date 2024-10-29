import GlossaryTable from "../tables/glossaryTable";
import { Sidebar, SidebarContent, SidebarExpandBtn, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader } from "../ui/sidebar";



export default function AppSidebar () {

    return (
        <Sidebar>
            <SidebarHeader></SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="items-center">
                        Glossary tab
                        {/* <SidebarExpandBtn className="ml-auto"></SidebarExpandBtn> */}
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