'use client'

import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { Button } from "../ui/button";
import TButton from "../buttons/translationBtn";




interface EditGlossaryTLPopoverProps {
    handleSave: (newDef: string, id: number) => void,
    idx: number,
    translation: string
}

export default function EditGlossaryTLPopover({
    handleSave,
    idx,
    translation
}: EditGlossaryTLPopoverProps) {

    const [isModalOpen, setIsModalOpen] = useState(false)
    const inputRef = useRef<HTMLInputElement>(null)
    const [isTooltipAllowed, setIsTooltipAllowed] = useState(false)

    /* const handleSaveChanges = (newDef: string, id: number) => {
        const updatedData = glossary.map((node, idx) => {
            if (id === idx) {
                return (
                    { ...node, translated_term: newDef }
                )
            } else {
                return node
            }
        })


        setGlossary(updatedData)
    } */

    
    const saveEntryupdate = () => {
        if (inputRef.current) {
            const input = inputRef.current.value
            handleSave(input, idx)
            setIsModalOpen(false)
        } 
    }





    return (
        <Popover open={isModalOpen} onOpenChange={setIsModalOpen}>
            <Tooltip>
                <TooltipTrigger asChild>
                    <PopoverTrigger asChild onMouseEnter={() => setIsTooltipAllowed(true)} onMouseLeave={() => setIsTooltipAllowed(false)}>
                        <TButton>
                            <span className="max-w-[0px] whitespace-nowrap">{translation}
                                </span>
                            </TButton>
                    </PopoverTrigger>
                </TooltipTrigger>
               { isTooltipAllowed && <TooltipContent>
                    <p>{translation}</p>
                </TooltipContent>}
            </Tooltip>
            <PopoverContent>
                <div className="flex flex-col gap-2">
                    <Input type="text" maxLength={30} ref={inputRef} required placeholder={translation}>

                    </Input>
                    <Button type="button" onClick={saveEntryupdate}>
                        Save
                    </Button>

                </div>
            </PopoverContent>

        </Popover>
    )
}