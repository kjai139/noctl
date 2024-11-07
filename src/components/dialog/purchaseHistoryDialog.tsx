import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";

interface PurchaseHistoryDialogProps {
    isDialogOpen: boolean,
    onOpenChange: () => void

}



export default function PurchaseHistoryDialog ({isDialogOpen, onOpenChange}: PurchaseHistoryDialogProps) {

    const [errorMsg, setErrorMsg] = useState('')

    const fetchPhistory = async () => {
        try {
            const response = await fetch('/api/purchase/getHistory', {
                next: {
                    tags: ['purchaseH']
                }
            })

            if (response.ok) {
                const json = await response.json()
                console.log('[fetchPhistory] ', json)
            } else {
                const json = await response.json()
                console.log('[fetchPhistory] Response not ok', json)
            }

        } catch (err) {
            console.log(err)
            if (err instanceof Error) {
                setErrorMsg(err.message)
            }
        }
    }

    useEffect(() => {
        fetchPhistory()
    }, [])


    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Purchase History
                    </DialogTitle>
                    <DialogDescription>
                        Record of your purchases
                    </DialogDescription>
                </DialogHeader>
                <Separator></Separator>
                {
                    errorMsg ? 
                    <div>
                        {errorMsg}
                    </div> : null
                }
                
                
            </DialogContent>
        </Dialog>
    )
}