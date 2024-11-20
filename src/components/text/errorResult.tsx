


export default function ErrorResult ({slotModelName, slotError}: {
    slotError:string,
    slotModelName:string
}) {

    return (
        <div className="whitespace-pre-line sm:p-10 px-4 py-8 relative max-w-[800px] min-h-[800px] flex-1 border-2 border-muted w-full mb-auto">
            <div className="flex sm:flex-row flex-col-reverse gap-2 sm:gap-0 justify-between items-center">
                <h2 className="underline font-semibold">{`Model: ${slotModelName}`}</h2>
            </div>
            <div className="pt-8 text-destructive font-semibold">
                {slotError}
            </div>
        </div>
    )
}