'use client'
import { SetStateAction, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Elements } from '@stripe/react-stripe-js'
import { getStripe } from '../../lib/loadStripeClient'
import CompletedPage from "../stripe/completedPage";
import CheckoutForm, { CheckoutProduct } from "../stripe/checkoutForm";

const stripePromise = getStripe()

interface addCurrencyDialogProps {
    isDialogOpen: boolean,
    setIsDialogOpen: React.Dispatch<SetStateAction<boolean>>,
    products: any
}



export default function AddCurrencyDialog ({isDialogOpen, setIsDialogOpen, products}:addCurrencyDialogProps) {

    const [clientSecret, setClientSecret] = useState('')
    const [dpmCheckerLink, setDpmCheckerLink] = useState("")
    const [confirmed, setConfirmed] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    
    const [curProduct, setCurProduct] = useState<CheckoutProduct | null>(null)

    const getPaymentInt = async (itemId:string) => {
        setClientSecret('')
        setDpmCheckerLink('')
        setCurProduct(null)
        setIsLoading(true)
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
            if (response.ok) {
                const data = await response.json()
                console.log('data:', data)
                setClientSecret(data.clientSecret);
                
                setDpmCheckerLink(data.dpmCheckerLink);
                const product = {
                    name:data.productName,
                    description:data.productDesc,
                    amount:data.amount,
                    currency:data.currency
                }
                setCurProduct(product)
            }
            setIsLoading(false)

        } catch (err) {
            console.error(err)
            setIsLoading(false)
        }
        
    }

    const options:any = {
        clientSecret: clientSecret,
        appearance: {
            theme:'stripe'
        }
    }

    const openChangeHandler = (open:boolean) => {
        if (!open) {
            setTimeout(() => {
                setClientSecret('')
            }, 500)
        }
        setIsDialogOpen(open)
    
    }

    const closeModal = () => {
        setTimeout(() => {
            setClientSecret('')
        }, 500)
        setIsDialogOpen(false)
    }

    return (
        <Dialog open={isDialogOpen} onOpenChange={openChangeHandler}>
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
                {
                    isLoading ?
                    <div className="flex justify-center items-center min-h-[400px]">
                    <div className="spinner">

                    </div>
                    </div>
                     :
                
                    <div>
                    {
                        clientSecret === '' ? 
                        ( 
                            products && products.length > 0 ?
                            <div className="flex flex-col gap-4">
                                {products.map((node:any) => {
    
                                    let price = (node.defaultPrice.unit_amount / 100).toFixed(2)
                                    return (
                                        <Button disabled={isLoading} onClick={() => getPaymentInt(node.id)} variant={'outline'} key={`pdl-${node.id}`} className="flex justify-between h-auto">
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
                        )
                        : 
                        (
                            <Elements stripe={stripePromise} options={options}>
                                {curProduct ? <CheckoutForm product={curProduct} dpmCheckerLink={dpmCheckerLink}
                                setIsDialogOpen={setIsDialogOpen}
                                closeModal={closeModal}
                                ></CheckoutForm> : null}
                            </Elements>
                        )
                    }
                    
                    </div>
                }
                
            </DialogContent>
        </Dialog>
    )
}