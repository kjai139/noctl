import { IoAlertCircleOutline } from "react-icons/io5"



const notifications = [
    {
      text:'New terms from subsequent translation request will continue to add onto the current glossary'
    },
    {
      text:'The glossary file you upload must be in JSON format'
    },
    {
      text:'Type "T" stands for Term and "N" stands for Name. *There can be rare mixups*'
    },
    
    ]

export default function GlossaryInfo () {

    return (
        <div className="flex gap-2 flex-col text-xs">
            <div className="flex gap-2 items-start">
                <div>
                    <IoAlertCircleOutline size={30}></IoAlertCircleOutline>
                </div>
                <p>This is a glossary to keep terms and names consistent when translating novels. An editable glossary will be auto-generated after each appropriate translation. You can then edit as needed and also save and upload it for future use.</p>
            </div>
            <ul>
                {notifications && notifications.map((node, idx) => {
                    return (
                        <li key={`noti-${idx}`} className="list-disc ml-4">
                            {node.text}
                        </li>
                    )
                })}
            </ul>
        </div>
    )
}