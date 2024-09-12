import { SetStateAction } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Label } from "../ui/label"
import { ModelsType } from "@/app/_types/glossaryType"


interface AiModelSelectProps {
    setModel: React.Dispatch<SetStateAction<ModelsType>>
}


export default function AiModelSelect({setModel}:AiModelSelectProps) {

    const models = [
        {
            name:'Standard'
        },
        {
            name:'Alt-1'
        },
    
    ]

    const handleValueChange = (value:ModelsType) => {
        setModel(value)
    }

    return (
        <div className="flex flex-col gap-2">
        <Select onValueChange={handleValueChange} defaultValue={'Standard'}>
        
            <SelectTrigger id="lang-select" className="border-none shadow-none hover:shadow hover:border">
                <SelectValue placeholder="Select Language">
                </SelectValue>
            </SelectTrigger>
        
            <SelectContent>
                {
                    models.map((node, idx) => {
                        return (
                            <SelectItem value={node.name} key={`models-${idx}`}>
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