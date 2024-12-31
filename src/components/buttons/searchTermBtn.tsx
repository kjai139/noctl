'use client'
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
import { ChangeEvent, useState } from "react"
import { useWorkState } from "@/app/_contexts/workStateContext"
import { TermLookup } from "@/app/action"
import { Input } from "../ui/input"
import { Textarea } from "../ui/textarea"
import { LanguagesType } from "@/app/_types/glossaryType"
  

interface searchTermBtnProps {
    term:string,
    language:string
}

interface termLookupProps {
    word:string,
}


export default function SearchTermBtn ({term, language}:searchTermBtnProps) {

    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [ isLoading, setIsLoading ] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')
    const [result, setResult] = useState('')
    const [curTerm, setCurTerm] = useState('')
    const [curContext, setCurContext] = useState('')
    const [curInterp,setCurInterp] = useState('')
    const [aLookupError, setALookupError] = useState('')
    const contextLimit = 240

    const termLookup = async () => {
        setCurTerm(term)
        setCurInterp('')
        setCurContext('')
        setIsDialogOpen(true)
        setIsLoading(true)
        
        setResult('')
        console.log(`Looking up ${term} in ${language}`)
        try {
            const response = await TermLookup({
                term: term,
                language: language
            })
            const json = JSON.parse(response)
            console.log(json)
            setIsLoading(false)
            const definition = json[0].explanation
            const interp = json[0].translated_term
            if (interp && interp !== 'null') {
                setCurInterp(interp)
            }
            setResult(definition)
    

        } catch (err) {
            setIsLoading(false)
            console.log(err)
        }
    }

    const additionalLookup = async (context:string) => {
        if (!context.includes(curTerm.toLowerCase())) {
            console.log('Please enter a sentence with the term in it.')
            setALookupError('Please enter a sentence with the term in it.')
        } else {
            setResult('')
            setCurInterp('')
            setIsLoading(true)
            try {
                const response = await TermLookup({
                    term: curTerm,
                    context: context,
                    language: language
                })

                const json = JSON.parse(response)
                console.log(json)
                setIsLoading(false)
                const definition = json[0].explanation
                const interp = json[0].translated_term
                setResult(definition)
                setCurInterp(interp)


            } catch (err) {
                setIsLoading(false)
                console.log(err)
            }
        }

    }

    const handleContextChange = (e:ChangeEvent<HTMLTextAreaElement>) => {
        setCurContext(e.target.value)
    }
    


    return (
        <>
        <Tooltip>
            <TooltipTrigger asChild>
                
                        <Button size={'sm'} variant={'ghostgloss'} onClick={() => termLookup()}>
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
            <DialogTitle>{curTerm} {curInterp ? `- ${curInterp}` : ''}</DialogTitle>
            <DialogDescription>
                Definition lookup
            </DialogDescription>
            </DialogHeader>
            {
                
            }
            <div>
                {isLoading ?
                <div className="flex justify-center items-center px-4 py-8">
                <div className="searchLoader"></div>
                </div>
                : 
                null
                }
                {
                    result && !isLoading ?
                    <div>
                        <span>
                        {result}
                        </span>
                        <div className="mt-4 flex flex-col gap-4">
                            <span className="text-destructive text-sm flex gap-2">
                                <span>
                                Don't think it's quite right? Provide more context.
                                </span>
                                <span>
                                    {`${curContext.length} / ${contextLimit}`}
                                </span>
                            </span>
                            <div className="flex gap-4">
                            <Textarea className="max-h-[650px]shadow-none resize-none focus-visible:ring-0" maxLength={contextLimit} value={curContext} onChange={handleContextChange} placeholder="Enter an example sentence or a small passage with the term included here..." onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement
                                    target.style.height = 'auto';
                                    target.style.height = `${target.scrollHeight}px`;
                                }}></Textarea>
                            <Button className="mt-auto" onClick={() => additionalLookup(curContext)}>
                                Re-search
                            </Button>
                            </div>
                            <span className="text-destructive font-semibold text-sm">
                                {aLookupError ? aLookupError : null}
                            </span>
                        </div>
                    </div>
                    : null
                }
            </div>
        </DialogContent>
        </Dialog>
        </>
        
    )
}