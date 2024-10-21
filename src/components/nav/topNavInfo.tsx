

export default function TopNavInfo () {


    return (
        <div className="flex justify-center p-4">
            <div className="mw w-full flex gap-4">
            <div className="flex-1">
                <div className="pt-8">
                <h1 className="text-2xl font-semibold">Modern Machine Translator</h1>
                <div className="flex flex-col">
                <p>
                    MMTL uses some of the most accurate modern LLMs for translating asian novels into English and vice versa. 
                </p>
                </div>
                </div>
            </div>
            <div className="flex-1 p-8">
                <span>
                <p>
                    Start by copy pasting text up to 10k characters and press translate. 
                    Text longer than 2k characters will be broken up into parts automatically and you will have to select the individual parts to translate them.
                </p>
                </span>
            </div>
            </div>
        </div>
    )
}