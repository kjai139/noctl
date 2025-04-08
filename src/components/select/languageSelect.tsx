import { SetStateAction } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { LanguagesType } from "@/app/_types/glossaryType"
import { Label } from "../ui/label"
import outputLanguages from "./outputLanguages"

interface GlossaryLangSelectProps {
    setLang: React.Dispatch<SetStateAction<LanguagesType>>
}

const language = [
    {
        name:'Japanese'
    },
    {
        name:'Korean'
    },
    {
        name:'English'
    },
    {
        name:'Chinese'
    }

]

export default function GlossaryLangSelect({setLang}:GlossaryLangSelectProps) {

    

    const handleValueChange = (value:LanguagesType) => {
        setLang(value)
    }

    return (
        <div className="flex flex-col">
        <Label htmlFor="lang-select"><span className="text-xs">Term Lookup Language</span></Label>
        <Select onValueChange={handleValueChange} defaultValue={'English'}>
        
            <SelectTrigger id="lang-select">
                <SelectValue placeholder="Select Language">
                </SelectValue>
            </SelectTrigger>
        
            <SelectContent>
                {
                    outputLanguages.map((node, idx) => {
                        return (
                            <SelectItem value={node.name} key={`glosslang-${idx}`}>
                                    {node.name} 
                            </SelectItem>
                        )
                    })
                }
            </SelectContent>
        
        </Select>
        </div>
    )
}