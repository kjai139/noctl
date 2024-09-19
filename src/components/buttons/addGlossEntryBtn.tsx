'use client'

import { GlossaryItem } from "@/app/_types/glossaryType";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { SetStateAction, useState } from "react";
import { IoIosAdd } from "react-icons/io";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

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

    const handleInputChange = (e) => {
        setTermInput(e.target.value)
    }

    const handleDefChange = (e) => {
        setDefInput(e.target.value)
    }

    const handleTermChange = (value:string) => {
        setTermType(value)
    }


    const addTerm = () => {
        console.log('Term ADD - ', termInput, defInput, termType)
        if (!termInput || !defInput || !termType) {
            if (termInput === '' || !termInput) {
                setTermError('Term name cannot be blank')   
            }
            if (!defInput) {
                setDefError('Enter the translated definition') 
            }
            if (!termType) {
                setTermTypeError('Choose a valid type')
            }
        } else if (termInput && defInput && termType) {
            const doesTermExist = glossary.some(obj => obj.term === termInput)
            if (doesTermExist) {
                setTermError('Term already exists.')
            } else {
                if (termType === 'name' || termType === 'term') {
                
                    const newTerm:GlossaryItem = {
                        term: termInput,
                        definition: defInput,
                        term_type: termType
                    } 
    
                    console.log(newTerm)
                    setGlossary((prev) => [...prev, newTerm])
                } else {
                    setTermTypeError('Choose a valid type')
                }
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
            <Button>
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
                    <Input id="term" value={termInput} onChange={handleInputChange} placeholder="カッパ">
                    </Input>
                    <span className="px-2">
                        {
                            termError ?
                            <span className="text-destructive text-sm">{termError}</span> : null
                        }
                    </span>
                </div>
                <div className="flex flex-col">
                    <Label htmlFor="definition" className="mb-2">
                        Definition
                    </Label>
                    <Input id="definition" value={defInput} onChange={handleDefChange} placeholder="Kappa"></Input>
                    <span className="px-2">
                        {
                            defError ?
                            <span className="text-destructive text-sm">{defError}</span> : null
                        }
                    </span>
                </div>
                <div>
                    <Label className="mb-2">Term type</Label>
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
                    </Select>
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