'use client'
import {
    PaymentElement,
    useStripe,
    useElements
  } from "@stripe/react-stripe-js";
import { useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import StripePowered from '../../../public/stripePowered.svg'
import { IoIosLock } from "react-icons/io";
import { Separator } from "../ui/separator";

export type CheckoutProduct = {
    name:string,
    description:string,
    amount:number,
    currency:string
}

interface CheckoutFormProps {
    dpmCheckerLink: string,
    product: CheckoutProduct | null
}

export default function CheckoutForm ({dpmCheckerLink, product}:CheckoutFormProps) {

    const stripe = useStripe()
    const elements = useElements()

    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
        setIsLoading(true)
        try {
            const { error } = await stripe.confirmPayment({
                elements: elements,
                confirmParams: {
                    return_url: "http://localhost:3000"
                },
                
              });

            if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message || 'An unexpected error has occured');
            } else {
            setMessage("An unexpected error occurred.");
            }
            setIsLoading(false)
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                <span className="text-lg">{product?.name}</span>
                <span className="text-sm text-muted-foreground">{product?.description}</span>
                </div>
                <div>
                    {
                        product && product.amount ? 
                        <span>
                            {`${(product.amount / 100).toFixed(2)} ${product.currency.toUpperCase()}`}
                        </span>
                    : null}
                </div>
            </div>
            <Separator className="mt-4"></Separator>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
                <div className="flex flex-col items-center gap-4">
                    
                    <span className="flex gap-2 items-center">
                        <IoIosLock></IoIosLock>
                        <span>
                        <strong>Safe & secured</strong> checkout guranteed
                        </span>
                    </span>
                    <span>
                    <Image src={StripePowered} alt="Powered by Stripe Logo" unoptimized></Image>
                    </span>
                </div>
                <PaymentElement options={{
                    layout: 'tabs'
                }}></PaymentElement>
                <div className="justify-end flex">
                <Button>Pay now</Button>
                </div>
           
                {message && 
                <div id="payment-message">{message}
                </div>}
            </form>
            <div id="dpm-annotation">
        <p className="mt-4">
          Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
          <a href={dpmCheckerLink} target="_blank" rel="noopener noreferrer" id="dpm-integration-checker" className='color-red'>Preview payment methods by transaction</a>
        </p>
      </div>
        </>
    )
}