'use client'

import { useOutputContext } from "@/app/_contexts/outputContext"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Label } from "../ui/label"
import { LanguagesType } from "@/app/_types/glossaryType"
import { Separator } from "../ui/separator"

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
    },
    {
        name:"Spanish"
    },
    {
        name:"French"
    }

]

export default function OutputSelect () {
    const { setOutputLang } = useOutputContext()

    const handleValueChange = (value:LanguagesType) => {
        setOutputLang(value)
    }
    return (
        
        <div>
        <Select onValueChange={handleValueChange} defaultValue={'English'}>
        
            <SelectTrigger id="outputlang-select" className="bg-background border-transparent shadow-none hover:shadow hover:border-blue-400 border-2 focus:ring-0">
                <SelectValue placeholder="Select Language">
                </SelectValue>
            </SelectTrigger>
        
            <SelectContent>
                <h6 className="text-sm p-1 text-center">Translate to</h6>
                <Separator></Separator>
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