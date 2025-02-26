import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"
import { forwardRef } from "react"

const buttonVariants = cva(
    "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 items-center",
    {
        variants: {
            variant: {
                default: "hover:cursor-text"
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
)

interface TButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {

}


const TButton = forwardRef<HTMLButtonElement, TButtonProps>  (({ className, variant, ...props}, ref) => {


    return (
        <button ref={ref} className={cn(buttonVariants({ variant }), className) } {...props}>
            
        </button>
    )

})

TButton.displayName = 'TButton'
export default TButton