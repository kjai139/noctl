import { TbCircleLetterRFilled } from "react-icons/tb";
import OutputSelect from "../select/outputSelect";


export default function TopNavInfo () {


    return (
        <div className="flex justify-center p-4 nv-cont">
            <div className="mw w-full flex gap-4 nv-item">
            <div className="flex-1">
                <div className="p-8">
                <h1 className="text-3xl font-semibold">Modern Machine Translator</h1>
                <div className="flex flex-col mt-1">
                <p>
                    Translating Asian literature into English and vice versa using the most accurate modern LLMs. 
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