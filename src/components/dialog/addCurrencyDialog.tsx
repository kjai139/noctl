import { SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { FaMoneyBillTrendUp } from "react-icons/fa6";

interface addCurrencyDialogProps {
    isDialogOpen: boolean,
    setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>
}

export default function AddCurrencyDialog ({isDialogOpen, setIsDialogOpen}:addCurrencyDialogProps) {

    const handleDialogOpen = (isOpen) => {
        setIsDialogOpen(isOpen)
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Add Currency
                    </DialogTitle>
                    <DialogDescription>
                    Buy currency to use the paid models
                    </DialogDescription>
                </DialogHeader>
                <div>
                    Content here
                </div>
                
            </DialogContent>
        </Dialog>
    )
}