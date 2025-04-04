import { SetStateAction, useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Separator } from "../ui/separator";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { TransactionObjModel } from "@/app/_types/transactionType";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { supportEmail } from "@/lib/supportEmail";

interface PurchaseHistoryDialogProps {
    isDialogOpen: boolean,
    onOpenChange: React.Dispatch<SetStateAction<boolean>>

}



export default function PurchaseHistoryDialog({ isDialogOpen, onOpenChange }: PurchaseHistoryDialogProps) {

    const [errorMsg, setErrorMsg] = useState('')
    const [transArr, setTransArr] = useState<[] | null>()
    const [isLoading, setIsLoading] = useState(false)
    const [isVerifying, setIsVerifying] = useState(false)
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = isDialogOpen
    }, [isDialogOpen])
    

    const fetchPhistory = async (key?:string) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/purchase/getHistory', {
                next: {
                    tags: ['purchaseH']
                },
                
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

    const verifyPiStatus = async (pId: string) => {
        try {
            setIsVerifying(true)
            const data = {
                pId: pId
            }
            const response = await fetch(`/api/purchase/verify`, {
                method: 'POST',
                body: JSON.stringify(data),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            if (response.ok) {
                const data = await response.json()
                console.log(data)
                if (isMounted.current) {
                    console.log('[Refetching purchase history]...')
                    fetchPhistory()
                } else {
                    console.log('[VerifyApi] Dialog closed. did not refetch')
                }
            }
            setIsVerifying(false)
        } catch (err) {
            console.error(err)
            setIsVerifying(false)
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
                        Record of your payment attempts
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
                {!errorMsg && !isLoading ?
                    <div className="h-auto md:h-[330px] flex flex-col justify-between max-h-[400px] overflow-auto">
                        <Table>
                            
                            <TableHeader className="hidden md:table-header-group">
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
                                    transArr && transArr.length > 0 && transArr.map((trans: TransactionObjModel, idx) => {
                                        let formatAmt = (trans.amount / 100).toFixed(2)
                                        let date = new Date(trans.createdAt)
                                        let formatDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

                                        return (
                                            <TableRow key={`trans-${idx}`} className="flex flex-col md:table-row">
                                                <TableCell>
                                                    {trans.productName}

                                                </TableCell>
                                                <TableCell className="w-[100px] md:w-auto text-muted-foreground">
                                                    {trans.paymentId}
                                                </TableCell>
                                                <TableCell>
                                                    ${formatAmt}
                                                </TableCell>
                                                <TableCell>
                                                    {formatDate}
                                                </TableCell>
                                                <TableCell>
                                                    {/* {trans.status === 'pending' && !trans.statusVerified || trans.status === 'incomplete' && !trans.statusVerified ?
                                                <span className="flex justify-between items-center gap-2">
                                                    <span>
                                                    {trans.status}
                                                    </span>
                                                    <Button onClick={() => verifyPiStatus(trans.paymentId)} disabled={isVerifying} size={'sm'} className="rounded">{isVerifying ? <Loader2 className="animate-spin"></Loader2> : 'Check Status'}
                                                    <span className="md:hidden ml-1">Verifying Status</span>
                                                    </Button>
                                                </span> :
                                                <span>
                                                {trans.status}
                                                </span>
                                                } */}
                                                <div className="justify-between flex items-center">
                                                    <span className={`${trans.status === 'completed' ? 'text-green-600' : ''}`}>
                                                        {trans.status}
                                                    </span>
                                                    {
                                                        trans.status === 'pending' || trans.status === 'incomplete' || trans.status === 'completed' ?
                                                            <span>
                                                                <Button variant={'ghost'} onClick={() => verifyPiStatus(trans.paymentId)} disabled={isVerifying} size={'sm'} className="rounded">{isVerifying ? <Loader2 className="animate-spin"></Loader2> : 'Check Status'}
                                                                    
                                                                </Button>
                                                            </span> : null
                                                    }
                                                </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                }


                            </TableBody>

                        </Table>
                        {
                            transArr && transArr.length === 0 &&
                            <div className="pt-4 text-muted-foreground">
                                You have not made any purchases.

                            </div>
                        }
                        
                    </div>
                    : null
                }

{
                            transArr && transArr.length > 0 &&
                            <span className="text-muted-foreground text-sm text-center">
                                For payment assistance, contact <strong>{supportEmail}</strong> with the payment ID.
                            </span>
                        }
            </DialogContent>
            
        </Dialog>
    )
}