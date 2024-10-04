'use client'
import { SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";

interface addCurrencyDialogProps {
    isDialogOpen: boolean,
    setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>,
    products: any
}



export default function AddCurrencyDialog ({isDialogOpen, setIsDialogOpen, products}:addCurrencyDialogProps) {

    const [clientSecret, setClientSecret] = useState('')
    const [dpmCheckerLink, setDpmCheckerLink] = useState("")
    const [confirmed, setConfirmed] = useState(false)


    const getPaymentInt = async (itemId:string) => {
        console.log('GETTING PAYMENT INT FOR ID', itemId)
        const item = {
            id:itemId
        }
        try {
            const response = await fetch('/api/create-paymentIntent/', {
                method: 'POST',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(item)
            })
            console.log(response)

        } catch (err) {
            console.error(err)
        }
        
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
                <Separator></Separator>
                <div>
                    {
                        products && products.length > 0 ?
                        <div className="flex flex-col gap-4">
                            {products.map((node:any) => {

                                let price = (node.defaultPrice.unit_amount / 100).toFixed(2)
                                return (
                                    <Button onClick={() => getPaymentInt(node.id)} variant={'outline'} key={`pdl-${node.id}`} className="flex justify-between h-auto">
                                        <span className="flex flex-col">
                                            <span className="text-lg font-semibold">
                                            {node.name}
                                            </span>
                                            <span className="text-muted-foreground text-sm">
                                                {node.description}
                                            </span>
                                        </span>
                                        <span className="min-w-[100px]">
                                            {`${price} ${node.defaultPrice.currency.toUpperCase()}`}
                                        </span>
                                    </Button>
                                )
                            })}

                        </div> :
                        <div>
                            ERROR, NO PRODUCTS
                        </div>
                    }
                </div>
                
            </DialogContent>
        </Dialog>
    )
}