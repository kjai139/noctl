import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import SuccessAnimatedIcon from "../animatedIcons/successAnimated";
import { Button } from "../ui/button";
import { SetStateAction } from "react";


interface RedirectResultModalProps {
    isOpen: boolean,
    isSuccess: boolean,
    resultMsg: string,
    setIsOpen: React.Dispatch<SetStateAction<boolean>>

}

export default function RedirectResultModal ({isOpen, isSuccess, resultMsg, setIsOpen}:RedirectResultModalProps) {


    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Payment Result</DialogTitle>
                    <DialogDescription>
                        Your payment status
                    </DialogDescription>
                </DialogHeader>
                {
                    resultMsg ? 
                    <div className="flex flex-col gap-8 items-center p-10">
                    {
                        isSuccess ? 
                        <SuccessAnimatedIcon></SuccessAnimatedIcon>
                        : 
                        null
                    }
                    <div className="flex flex-col gap-4">
                    <span>
                        {resultMsg}
                    </span>
                    <DialogClose asChild>
                    <Button variant={'pmt'}>Close</Button>
                    </DialogClose>
                    </div>
                    </div>
                    : 
                    <div className="flex justify-center items-center min-h-[400px]">
                    <div className="spinner">

                    </div>
                    </div>
                }
                
            </DialogContent>
        </Dialog>
    )
}