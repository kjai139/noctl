'use client'
import {
    PaymentElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { SetStateAction, useEffect, useState } from "react";
import { Button } from "../ui/button";
import Image from "next/image";
import StripePowered from '../../../public/stripePowered.svg'
import { IoIosLock } from "react-icons/io";
import { Separator } from "../ui/separator";
import SuccessAnimatedIcon from "../animatedIcons/successAnimated";
import { useWorkState } from "@/app/_contexts/workStateContext";
import { type Session } from 'next-auth'
import { UpdateUserCurrency } from "@/app/_utils/updateUserCurrency";
import { fiveDollarCurAmt, oneDollarCurAmt, tenDollarsCurAmt, twentyDollarCurAmt } from "@/lib/currencyPrice";
import { createTransactionEntry } from "@/app/action";
import UpdateTransStatus from "@/app/_utils/updateTransStatus";

export type CheckoutProduct = {
    productDesc: string,
    amount: number,
    currency: string,
    pId: string,
    productName: string,
}

interface CheckoutFormProps {
    dpmCheckerLink: string,
    product: CheckoutProduct,
    isDialogOpen?: boolean,
    setIsDialogOpen?: React.Dispatch<SetStateAction<boolean>>,
    closeModal: () => void,
    session: Session | null

}

export default function CheckoutForm({ dpmCheckerLink, product, isDialogOpen, closeModal, session }: CheckoutFormProps) {

    const stripe = useStripe()
    const elements = useElements()

    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const [paymentFailed, setPaymentFailed] = useState(false)

    const [dbErrorMsg, setDbErrorMsg] = useState('')


    const { setUserCurrency } = useWorkState()

    const handleUpdateCurrency = async () => {
        try {
            const updatedCur = await UpdateUserCurrency()
            console.log('[UpdateUserCur]', updatedCur)
            setUserCurrency(updatedCur)
        } catch (err) {
            console.error(err)
        }
    }



    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setDbErrorMsg('')
        setMessage('')
        if (!stripe || !elements) {
            // Stripe.js hasn't yet loaded.
            // Make sure to disable form submission until Stripe.js has loaded.
            return;
        }
        console.log('[Stripe confirmPayment] paymentIntent Id:', product.pId)
        setIsLoading(true)


        try {
            const createPendingEntry = await createTransactionEntry(product)
            if (!createPendingEntry) {
                throw new Error('Encountered a server error. Your payment was not processed, please try again later.')
            }
            const response = await stripe.confirmPayment({
                elements: elements,
                confirmParams: {
                    return_url: "http://localhost:3000"
                },
                redirect: 'if_required'

            });
            console.log('response confirm payment', response)
            if (response.paymentIntent && response.paymentIntent.status === 'succeeded') {
                console.log('Payment successful.')


                try {
                    await UpdateTransStatus(product.pId)
                } catch (err) {
                    setDbErrorMsg(`However, we encountered a possible connection issue. Check the payment history tab and your balance. Contact support if needed.`)
                    
                }

                setPaymentSuccess(true)
                setIsLoading(false)
            }
            if (response.error?.type === "card_error" || response.error?.type === "validation_error" || response.error?.type === 'invalid_request_error') {
                setMessage(response.error.message || 'An unexpected error has occured');
                setIsLoading(false)
            } else {
                setMessage("An unexpected error occurred.");
                setIsLoading(false)
            }

        } catch (err) {
            console.error(err)
            if (err instanceof Error) {
                setMessage(err.message)
            } else {
                setMessage('An unexpected error has occured. Please try again later.')
            }
            setIsLoading(false)


        }
    }



    return (
        <>
            <div className="flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-lg">{product?.productName}</span>
                    <span className="text-sm text-muted-foreground">{product?.productDesc}</span>
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

            {
                paymentSuccess && !isLoading ?
                    <div className="flex flex-col gap-8 items-center p-10">
                        <SuccessAnimatedIcon></SuccessAnimatedIcon>
                        <div className="flex flex-col gap-4">
                            <span className="text-center flex flex-col gap-2">
                                <span className="font-semibold">
                                Payment Successful
                                </span>
                                <span className="text-muted-foreground text-sm">
                                {`Payment ID: ${product.pId}`}
                                </span>  
                            </span>
                            {dbErrorMsg ? 
                            <span className="text-destructive flex flex-col gap-2 font-semibold">
                                <p>{dbErrorMsg}</p>
                                <p className="text-sm">
                                Contact support with that ID if you need help.
                                </p>
                            </span> : null
                            }
                            <Button variant={'pmt'} onClick={() => closeModal()}>Close</Button>
                        </div>
                    </div>
                    : null

            }
           
            {!paymentFailed && !paymentSuccess ?
                <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4 min-height-[240px]">
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
                    <div className="min-h-[230px] relative">
                        {
                            isLoading && !paymentFailed && !paymentSuccess ?
                                <div className="flex justify-center items-center min-h-[230px] absolute w-full z-10 spin-bd h-full">
                                    <div className="spinner">

                                    </div>
                                </div> : null
                        }
                        <PaymentElement options={{
                            layout: 'tabs'
                        }}></PaymentElement>
                    </div>
                    <div className="justify-between flex">
                        {message &&
                            <div id="payment-message" className="text-destructive font-semibold">{message}
                            </div>}
                        <Button disabled={isLoading} className="ml-auto">Pay now</Button>
                    </div>


                </form> : null}
            {/* <div id="dpm-annotation">
        <p className="mt-4">
          Payment methods are dynamically displayed based on customer location, order amount, and currency.&nbsp;
          <a href={dpmCheckerLink} target="_blank" rel="noopener noreferrer" id="dpm-integration-checker" className='color-red'>Preview payment methods by transaction</a>
        </p>
      </div> */}
        </>
    )
}