import { SetStateAction } from "react"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"
import { Label } from "../ui/label"
import { ModelsType } from "@/app/_types/glossaryType"
import { Separator } from "../ui/separator"


interface AiModelSelectProps {
    setModel: React.Dispatch<SetStateAction<ModelsType>>
}

const models = [
    {
        name: 'Standard',
        model: 'standard'
    },
    {
        name: 'Better-1',
        model: 'b1'
    },
    {
        name: 'Better-2',
        model: 'b2'
    }

    /* {
        name:'Test-1'
    } */

]

const duoModels = [
    {
        name: 'Standard / Better-1',
        model: 'sb1'
    },
    {
        name: 'Standard / Better-2',
        model: 'sb2'
    },
    {
        name: 'Better-1 / Better-2',
        model: 'b12'
    },

]

export default function AiModelSelect({ setModel }: AiModelSelectProps) {

    

    const handleValueChange = (value: ModelsType) => {
        setModel(value)
    }

    return (
        <div className="flex flex-col gap-2">
           
            <Select onValueChange={handleValueChange} defaultValue={'standard'}>

                <SelectTrigger id="lang-select" className="border-none shadow-none hover:shadow">
                    <SelectValue placeholder="Select Model">
                    </SelectValue>
                </SelectTrigger>

                <SelectContent>
                    {
                        models.map((node, idx) => {
                            return (
                                <SelectItem value={node.model} key={`models-${idx}`}>
                                    {node.name}
                                </SelectItem>
                            )
                        })
                    }
                    <span className="mt-2 p-2 w-full justify-center font-semibold text-sm">
                        Duo Modes
                    </span>
                    <Separator></Separator>
                    {
                        duoModels.map((node, idx) => {
                            return (
                                <SelectItem value={node.model} key={`duoModels-${idx}`}>
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