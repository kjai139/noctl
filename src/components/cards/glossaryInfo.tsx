import { IoAlertCircleOutline } from "react-icons/io5"



const notifications = [
    {
      text:'New terms from subsequent translation request will continue to add onto the current glossary'
    },
    {
      text:'The glossary file must be in proper .json format'
    },
    
    ]

export default function GlossaryInfo () {

    return (
        <div className="flex gap-4 flex-col text-sm">
            <div className="flex gap-2 items-start">
                <div>
                    <IoAlertCircleOutline size={30}></IoAlertCircleOutline>
                </div>
                <p>The glossary is used to keep terms and names consistent when translating things like novels. An editable glossary will be auto-generated after each successful prompt when appropirate. Edit as needed and you can also save it for future use.</p>
            </div>
            <ul className="flex flex-col gap-2">
                {notifications && notifications.map((node, idx) => {
                    return (
                        <li key={`noti-${idx}`} className="grid grid-cols-[25px_1fr] items-start">
                            <span className="rounded-full bg-primary h-2 w-2 translate-y-1">
                            
                            </span>
                            <span>
                            {node.text}
                            </span>
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}