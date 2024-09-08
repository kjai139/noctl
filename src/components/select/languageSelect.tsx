import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select"


export default function GlossaryLanguageSelect({setLang}) {

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

    const handleValueChange = (e) => {
        setLang(e.target.value)
    }

    return (
        <Select onValueChange={handleValueChange} defaultValue={'English'}>
        
            <SelectTrigger>
                <SelectValue placeholder="Select Language">
                </SelectValue>
            </SelectTrigger>
        
            <SelectContent>
                {
                    language.map((node, idx) => {
                        return (
                            <SelectItem value={node.name} key={`glosslang-${idx}`}>
                                    {node.name} 
                            </SelectItem>
                        )
                    })
                }
            </SelectContent>
        
        </Select>
    )
}