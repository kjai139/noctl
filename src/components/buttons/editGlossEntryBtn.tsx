import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { GoSearch } from "react-icons/go";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useState } from "react";



export default function EditGlossEntryBtn() {

    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const openDialog = () => {
        setIsDialogOpen(true)
    }


    return (
        <>
            <Tooltip>
                <TooltipTrigger asChild>
          
                <Button variant={'ghost'} size={'icon'} onClick={openDialog}>
                    <GoSearch></GoSearch>
                </Button>
          
            </TooltipTrigger>
            <TooltipContent>
                Search Glossary
            </TooltipContent>
            </Tooltip>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Glossary lookup
                        </DialogTitle>
                        <DialogDescription>
                            Quick lookup and edit
                        </DialogDescription>
                    </DialogHeader>
                    <div>
                        Content here
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}