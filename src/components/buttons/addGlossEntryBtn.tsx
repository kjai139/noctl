'use client'

import { GlossaryItem } from "@/app/_types/glossaryType";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SetStateAction, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { useSidebar } from "../ui/sidebar";

interface AddGlossaryEntryBtnProps {
    glossary: GlossaryItem[],
    setGlossary: React.Dispatch<SetStateAction<GlossaryItem[] | []>>
}

export default function AddGlossEntryBtn ({glossary, setGlossary}:AddGlossaryEntryBtnProps) {

    const [termTypeError, setTermTypeError] = useState('')
    const [termError, setTermError] = useState('')
    const [defError, setDefError] = useState('')

    const [termInput, setTermInput] = useState("")
    const [defInput, setDefInput] = useState('')
    const [termType, setTermType] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const { mobileFocusRef } = useSidebar() 

    const handleInputChange = (e:any) => {
        setTermInput(e.target.value)
    }

    const handleDefChange = (e:any) => {
        setDefInput(e.target.value)
    }

    const handleTermChange = (value:string) => {
        setTermType(value)
    }


    const addTerm = () => {
        console.log('Term ADD - ', termInput, defInput)
        if (!termInput || !defInput) {
            if (termInput === '' || !termInput) {
                setTermError('Term name cannot be blank')   
            }
            if (!defInput) {
                setDefError('Translated term cannot be blank') 
            }
            /* if (!termType) {
                setTermTypeError('Choose a valid type')
            } */
        } else if (termInput && defInput) {
            const doesTermExist = glossary.some(obj => obj.term === termInput)
            if (doesTermExist) {
                setTermError('Term already exists.')
            } else {
                    const newTerm:GlossaryItem = {
                    term: termInput,
                    translated_term: defInput,
                } 

                console.log(newTerm)
                setGlossary((prev) => [...prev, newTerm])
                setIsOpen(false)
                
            }
        }   
        
    }

    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (open) {
            setTermError('')
            setTermTypeError('')
            setDefError('')
            setDefInput('')
            setTermInput('')
            setTermType('')

        }
    }


    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
            <Button variant={'ghost'} ref={mobileFocusRef}>
                <div className="flex items-center">
                    <IoIosAdd size={30}></IoIosAdd>
                    <span>Add Term</span>
                </div>
            </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add term
                    </DialogTitle>
                    <DialogDescription>
                        Add a term to the glossary
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col">
                    <Label htmlFor="term" className="mb-2">
                        Term
                    </Label>
                    <Input autoComplete="off" id="term" value={termInput} onChange={handleInputChange} placeholder="カッパ">
                    </Input>
                    <span className="px-2">
                        {
                            termError ?
                            <span className="text-destructive text-sm">{termError}</span> : null
                        }
                    </span>
                </div>
                <div className="flex flex-col">
                    <Label htmlFor="translatedTerm" className="mb-2">
                        Translated Term
                    </Label>
                    <Input autoComplete="off" id="translatedTerm" value={defInput} onChange={handleDefChange} placeholder="Kappa"></Input>
                    <span className="px-2">
                        {
                            defError ?
                            <span className="text-destructive text-sm">{defError}</span> : null
                        }
                    </span>
                </div>
                <div>
                   {/*  <Label className="mb-2">Term type</Label>
                    <Select value={termType} onValueChange={handleTermChange}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a type">

                            </SelectValue>

                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectItem value="term">
                                    Term
                                </SelectItem>
                                <SelectItem value="name">
                                    Name
                                </SelectItem>
                            </SelectGroup>
                        </SelectContent>
                    </Select> */}
                    <span className="p-2">
                        {
                            termTypeError ?
                            <span className="text-destructive text-sm">{termTypeError}</span> : null
                        }
                    </span>
                </div>
                <DialogFooter>
                    <Button onClick={addTerm}>Save</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}