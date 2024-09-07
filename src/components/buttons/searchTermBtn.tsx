import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from "../ui/button"
import { TbReportSearch } from "react-icons/tb"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { useState } from "react"
  

interface searchTermBtnProps {
    term:string,
}


export default function SearchTermBtn ({term}:searchTermBtnProps) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const termLookup = (term:string) => {
        setIsDialogOpen(true)
        console.log('Looking up', term)
    }
    


    return (
        <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                
                        <Button size={'sm'} variant={'ghost'} onClick={() => termLookup(term)}>
                        <TbReportSearch size={20}></TbReportSearch>
                        </Button>
                
            </TooltipTrigger>
            <TooltipContent>
            <p>Term lookup</p>
            </TooltipContent>
        </Tooltip>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        
        <DialogContent>
            <DialogHeader>
            <DialogTitle>Term Lookup</DialogTitle>
            <DialogDescription>
                Definition lookup
            </DialogDescription>
            </DialogHeader>
            {
                
            }
            <div>
                CONTENT HERE
            </div>
        </DialogContent>
        </Dialog>
        </TooltipProvider>
    )
}