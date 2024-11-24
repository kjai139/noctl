import { TiDeleteOutline } from "react-icons/ti"
import { Button } from "../ui/button"
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from "../ui/tooltip"
interface DeleteTermBtnProps {
    onClick: () => void
}

export default function DeleteTermBtn ({onClick}:DeleteTermBtnProps) {


    return (
        <TooltipProvider>
        <Tooltip>
            <TooltipTrigger asChild>
                
            <Button variant={'ghostgloss'} onClick={onClick}>
            <TiDeleteOutline size={20}></TiDeleteOutline>

            </Button>
                
            </TooltipTrigger>
            <TooltipContent>
            <p>Delete entry</p>
            </TooltipContent>
        </Tooltip>
        </TooltipProvider>
        
    )
}