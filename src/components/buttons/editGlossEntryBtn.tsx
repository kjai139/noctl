import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { GoSearch } from "react-icons/go";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SetStateAction, useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { GlossaryItem } from "@/app/_types/glossaryType";
import { Loader2 } from "lucide-react";
import { IoSearchSharp } from "react-icons/io5";


interface EditGlossaryEntryBtnProps {
    glossary: GlossaryItem[];
    setGlossary: React.Dispatch<SetStateAction<GlossaryItem[] | []>>
}

export default function EditGlossEntryBtn({ glossary, setGlossary }: EditGlossaryEntryBtnProps) {

    const inputRef = useRef<HTMLInputElement | null>(null)
    const editInputRef = useRef<HTMLInputElement | null>(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchResult, setSearchResult] = useState<GlossaryItem | null | 'empty'>(null)
    const [searchResultIdx, setSearchResultIdx] = useState<number | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const openDialog = () => {
        setIsDialogOpen(true)
    }

    const onDialogOpenChange = (state:boolean) => {
    
        
        setIsDialogOpen(state)
    }

    useEffect(() => {
        if(!isDialogOpen) {
            setErrorMsg('')
            setSearchResult(null)
            setSearchResultIdx(null)
        }
    }, [isDialogOpen])

    const searchGlossary = () => {
        setErrorMsg('')
        setIsLoading(true)
        if (inputRef.current && inputRef.current.value) {
            const word = inputRef.current.value.trim().toLowerCase()
            if (!word) {
                setErrorMsg('Please enter a word.')
                return
            }
            const index = glossary.findIndex(obj => obj.term.toLowerCase() === word || obj.translated_term.toLowerCase() === word)
            if (index !== -1) {
                console.log(`term ${word} found.`)
                console.log(glossary[index])
                setSearchResult(glossary[index])
                setSearchResultIdx(index)
            } else {
                console.log(`term ${word} not found.`)
                setSearchResult('empty')
            }
        } else {
            console.log('no word')
        }
        setIsLoading(false)
    }

    const updateGlossaryEntry = () => {
        if (searchResultIdx !== null) {
            if (!isNaN(searchResultIdx)) {
                console.log('[updateGlossEntry] index is', searchResultIdx)
                if (editInputRef.current && editInputRef.current.value) {
                    const editInputValue = editInputRef.current.value
                    setGlossary((prev) => {
                        const newList = [...prev]
                        newList[searchResultIdx] = { ...newList[searchResultIdx], translated_term: editInputValue }
                        return newList
                    })
                }
                setIsDialogOpen(false)
                
            }
        } else {
            console.log('[updateGlossEntry] ')
        }
        
    }


    return (
        <>
            {/* <Tooltip>
                <TooltipTrigger asChild>

                    <Button variant={'ghost'} onClick={openDialog}>
                    <div className="flex items-center w-full">
                        <div className="w-[30px] h-[30px] flex items-center justify-center">
                        <IoSearchSharp size={15}></IoSearchSharp>
                        </div>
                        <span>Search</span>
                        </div>
                    </Button>

                </TooltipTrigger>
                <TooltipContent>
                    Search Glossary
                </TooltipContent>
            </Tooltip> */}
            <Button variant={'ghost'} onClick={openDialog}></Button>
            <Dialog open={isDialogOpen} onOpenChange={onDialogOpenChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            Glossary lookup
                        </DialogTitle>
                        <DialogDescription>
                            Lookup and edit
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-2">
                        <div className="flex gap-2 w-full items-end">
                            <div className="flex flex-1">
                                <Label className="w-full">Search word
                                    <Input className="mt-1" maxLength={25} ref={inputRef} type="text" placeholder="Enter something here..."></Input>
                                </Label>

                            </div>
                            <div>
                                <Button disabled={isLoading} onClick={searchGlossary}>{ isLoading ? <Loader2 className="animate-spin"></Loader2> : <IoSearchSharp size={20}></IoSearchSharp>}</Button>
                            </div>
                        </div>
                        {
                            errorMsg && 
                            <span className="text-destructive font-semibold text-sm">{errorMsg}</span>
                        }
                        {
                            searchResult && searchResult !== 'empty' &&
                            <div className="mt-4">
                                <div className="flex w-full gap-4">
                                <span className="flex-1">
                                    {searchResult.term}
                                </span>
                                <span>
                                    <Input key={`${searchResult.translated_term}-inp`} ref={editInputRef} type="text" defaultValue={searchResult.translated_term}></Input>
                                    
                                </span>
                                <Button type="button" onClick={updateGlossaryEntry}>Update</Button>
                                </div>
                                
                            </div>
                        }
                        {searchResult && searchResult === 'empty' &&
                            <div className="text-sm">
                                No matches.
                            </div>
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}