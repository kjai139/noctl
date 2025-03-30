import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { GoSearch } from "react-icons/go";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { useRef, useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";



export default function EditGlossEntryBtn({ glossary, setGlossary }) {

    const inputRef = useRef<HTMLInputElement | null>(null)
    const editInputRef = useRef<HTMLInputElement | null>(null)

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [searchResult, setSearchResult] = useState()
    const [searchResultIdx, setSearchResultIdx] = useState()

    const openDialog = () => {
        setIsDialogOpen(true)
    }

    const searchGlossary = () => {
        if (inputRef.current && inputRef.current.value) {
            const word = inputRef.current.value
            const index = glossary.findIndex(obj => obj.term === word)
            if (index !== -1) {
                console.log(`term ${word} found. obj - ${glossary[index]}`)
                setSearchResult(glossary[index])
                setSearchResultIdx(index)
            }
        }
    }

    const updateGlossaryEntry = () => {
        setGlossary((prev) => {
            const newList = [...prev]
            newList[searchResultIdx] = { ...newList[searchResultIdx], translated_term: editInputRef }
            return newList
        })
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
                        <div className="flex gap-2 w-full">
                            <div className="flex flex-1">
                                <Label>Search word
                                    <Input ref={inputRef} type="text" placeholder="Type here..."></Input>
                                </Label>

                            </div>
                            <div>
                                <Button size={'icon'}><GoSearch></GoSearch></Button>
                            </div>
                        </div>
                        {
                            searchResult && 
                            <div>
                                Found:
                                <span>
                                    {searchResult.term}
                                </span>
                                <span>
                                    <Input ref={editInputRef} type="text" value={searchResult.translated_term}></Input>
                                    <Button>Update</Button>
                                </span>
                            </div>
                        }
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}