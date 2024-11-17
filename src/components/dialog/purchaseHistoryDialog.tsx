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
    const [isLoading, setIsLoading] = useState(false)

    const fetchPhistory = async () => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/purchase/getHistory', {
                next: {
                    tags: ['purchaseH']
                }
            })
            setIsLoading(false)
            if (response.ok) {
                const json = await response.json()
                console.log('[fetchPhistory] ', json)
                setTransArr(json.trans)
            } else {
                const json = await response.json()
                console.log('[fetchPhistory] Response not ok', json)
            }

        } catch (err) {
            setIsLoading(false)
            console.log(err)
            if (err instanceof Error) {
                setErrorMsg(err.message)
            }
        }
    }

    useEffect(() => {
        if (isDialogOpen) {
            fetchPhistory()
        }
        
    }, [isDialogOpen])


    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-[800px] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        Purchase History
                    </DialogTitle>
                    <DialogDescription>
                        Record of your purchases
                    </DialogDescription>
                </DialogHeader>
                {/* <Separator></Separator> */}
                {
                    isLoading ?
                    <div className="flex justify-center items-center min-h-[330px] w-full z-10 spin-bd">
                    <div className="spinner">

                    </div>
                    </div> : null
                }
                {
                    errorMsg && !isLoading ? 
                    <div>
                        {errorMsg}
                    </div> : null
                }
                {   !errorMsg && !isLoading ?
                <div className="h-[330px]">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Item</TableHead>
                                <TableHead>Payment Id</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Purchase Date</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {
                                transArr && transArr.length > 0 && transArr.map((trans:TransactionObjModel, idx) => {
                                    let formatAmt = (trans.amount / 100).toFixed(2)
                                    let date = new Date(trans.createdAt)
                                    let formatDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

                                    return (
                                        <TableRow key={`trans-${idx}`}>
                                            <TableCell>
                                                {trans.productName}

                                            </TableCell>
                                            <TableCell className="w-[100px] sm:w-auto">
                                                {trans.paymentId}
                                            </TableCell>
                                            <TableCell>
                                                {formatAmt}
                                            </TableCell>
                                            <TableCell>
                                                {formatDate}
                                            </TableCell>
                                            <TableCell>
                                                {trans.status}
                                            </TableCell>
                                        </TableRow>
                                    )
                                })
                            }
                            {
                                transArr && transArr.length === 0 &&
                                <div className="pt-4 text-muted-foreground">
                                    You have not made any purchases.

                                </div>
                            }

                        </TableBody>
                    </Table>
                    </div>
                    : null
                }
                
                
            </DialogContent>
        </Dialog>
    )
}