


export default function ResultWrap ({children}:{
    children: React.ReactNode
}) {

    return (
        <div className="whitespace-pre-line p-10 relative max-w-[800px] flex-1 border-2 border-muted w-full mb-auto">
            {children}
        </div>
    )
}