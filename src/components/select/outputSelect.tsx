'use client'

import { useOutputContext } from "@/app/_contexts/outputContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Label } from "../ui/label"
import { LanguagesType } from "@/app/_types/glossaryType"

const outputLanguages = [
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

export default function OutputSelect () {
    const { setOutputLang } = useOutputContext()

    const handleValueChange = (value:LanguagesType) => {
        setOutputLang(value)
    }
    return (
        <div className="flex flex-col gap-2">
        <Label htmlFor="outputlang-select"><span className="text-lg">Output Language</span></Label>
        <Select onValueChange={handleValueChange} defaultValue={'English'}>
        
            <SelectTrigger id="outputlang-select" className="bg-background">
                <SelectValue placeholder="Select Language">
                </SelectValue>
            </SelectTrigger>
        
            <SelectContent>
                {
                    outputLanguages.map((node, idx) => {
                        return (
                            <SelectItem value={node.name} key={`outputlang-${idx}`}>
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