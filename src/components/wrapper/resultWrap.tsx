


export default function ResultWrap ({children}:{
    children: React.ReactNode
}) {

    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] flex-1 border-2 border-muted w-full mb-auto">
            {children}
        </div>
    )
}