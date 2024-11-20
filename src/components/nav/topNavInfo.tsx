import { TbCircleLetterRFilled } from "react-icons/tb";
import OutputSelect from "../select/outputSelect";


export default function TopNavInfo () {


    return (
        <div className="flex justify-center p-4 hbg mb-8">
            <div className="mw w-full flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
                <div className="p-8">
                <h1 className="text-2xl font-semibold">Modern Machine Translator</h1>
                <div className="flex flex-col mt-1">
                <p>
                    MMTL uses the most modern LLMs for translating Asian languages into English. 
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                    Start by signing in with gmail to receive a one-time bonus of 10 free credits <TbCircleLetterRFilled size={18} className="inline text-primary"></TbCircleLetterRFilled> for the paid models.
                </p>
                </div>
                </div>
            </div>
            <div className="flex-1 p-8 flex items-center justify-center">
                <span>
                <OutputSelect></OutputSelect>
                </span>
            </div>
            </div>
        </div>
    )
}