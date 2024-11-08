import { SetStateAction, useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TransactionObjModel } from "@/app/_types/transactionType";

interface PurchaseHistoryDialogProps {
    isDialogOpen: boolean,
    onOpenChange: React.Dispatch<SetStateAction<boolean>>

}



export default function PurchaseHistoryDialog ({isDialogOpen, onOpenChange}: PurchaseHistoryDialogProps) {

    const [errorMsg, setErrorMsg] = useState('')
    const [transArr, setTransArr] = useState<[] | null>()

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
                setTransArr(json.trans)
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
                {   !errorMsg ?
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Description</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Purchase Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                transArr && transArr.map((trans:TransactionObjModel, idx) => {
                                    return (
                                        <TableRow key={`trans-${idx}`}>
                                            <TableCell>
                                                {trans.productName}

                                            </TableCell>
                                            <TableCell>
                                                {trans.productDesc}
                                            </TableCell>
                                            <TableCell>
                                                {trans.amount}
                                            </TableCell>
                                            <TableCell>
                                                {trans.createdAt}
                                            </TableCell>
                                            <TableCell>
                                                {trans.status}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }

                        </TableBody>
                    </Table>
                    : null
                }
                
                
            </DialogContent>
        </Dialog>
    )
}