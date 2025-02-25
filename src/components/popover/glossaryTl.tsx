'use client'

import { useState } from "react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import TButton from "../buttons/translationBtn";



interface EditGlossaryTLPopoverProps {
    handleSave: (newDef: string, id:number) => void,
    idx: number,
    translation: string
}

export default function EditGlossaryTLPopover({
    handleSave,
    idx,
    translation
}:EditGlossaryTLPopoverProps) {

    const [isModalOpen, setIsModalOpen] = useState(false)

    return (
        <Popover>
            <Tooltip>
                <TooltipTrigger asChild>
            <PopoverTrigger asChild>
                <TButton>{translation}</TButton>
        </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>
            <p>{translation}</p>
        </TooltipContent>
        </Tooltip>
        <PopoverContent>
            <div>
                <h4 className="leading-none">Edit Translation</h4>
                
            </div>
        </PopoverContent>
        
        </Popover>
    )
}