import { TbCircleLetterRFilled } from "react-icons/tb";
import OutputSelect from "../select/outputSelect";


export default function TopNavInfo () {


    return (
        <div className="flex justify-center p-4 nv-cont">
            <div className="mw w-full flex gap-4 nv-item">
            <div className="flex-1 flex justify-center">
                <div className="p-8 ta-mw">
                <h1 className="text-5xl font-semibold text-center">Machinax</h1>
                <div className="flex flex-col mt-1 items-center">
                <p className="text-xl text-center">
                    Translating literature using the most accurate modern LLMs. 
                </p>
                <p className="text-sm text-muted-foreground mt-4 text-center max-w-[340px]">
                    Start by signing in with gmail to receive a one-time bonus of 10 free credits <TbCircleLetterRFilled size={18} className="inline text-primary"></TbCircleLetterRFilled> for the paid models.
                </p>
                </div>
                </div>
            </div>
            {/* <div className="flex-1 p-8 flex items-center justify-center">
                <span>
                <OutputSelect></OutputSelect>
                </span>
            </div> */}
            </div>
        </div>
    )
}