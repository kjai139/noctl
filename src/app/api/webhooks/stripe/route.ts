import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import stripe from '@/lib/stripe'
import connectToMongoose from "@/lib/mongoose";
import TransactiionModel from '@/app/_models/transactionModel'
import mongoose from 'mongoose'
import userModel from "@/app/_models/userModel";

export async function POST (req:NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig as string, process.env.STRIPE_WEBHOOK_LOCAL_SECRET as string)
        console.log('[Stripe] Listening to Webhook events')
    } catch (err) {
        console.error(err)
        return NextResponse.json({
            message: `Stripe Webhook Error: ${(err as Error).message}`
        }, {
            status: 400
        })
    }



    try {
        try {
            await connectToMongoose()
        } catch (err) {
            console.error('[Sripe Webhook] Error connecting to MONGODB', err)
        }
        switch (event.type) {
            case "checkout.session.async_payment_succeeded":
                const session = event.data.object
                console.log('[Stripe webhook async payment completed] Session -', session)
                break
            case "checkout.session.async_payment_failed":
                const session2 = event.data.object
                console.log('[Stripe webhook payment failed] Session - ', session2)
                break
            case "checkout.session.completed":
                const session3 = event.data.object
                console.log('[Stripe webhook payment completed]', session3)
                break
            case "payment_intent.succeeded":
                const session4 = event.data.object
                console.log('[Stripe webhook payment intent succeeded]', session4)
                const dbSess = await mongoose.startSession()
                dbSess.startTransaction()
                try {
                    
                    const newTransaction = new TransactiionModel({
                        paymentId: session4.id,
                        userId: session4.metadata.userId,
                        amount: session4.amount,
                        transactionType:'purchase'
    
                    })
                    let requests
                    switch (session4.amount) {
                        case 100:
                            requests = 150
                            console.log('[Stripe Webhook] Adding 150 request credits...')
                            break
                        case 1000:
                            requests = 1550
                            console.log('[Stripe Webhook] Adding 1550 request credits...')
                            break
                        default:
                            console.log('[Stripe Webhook] Unhandled currency amount detected:', session4.amount)
                            break
                    }
    
                    await newTransaction.save({ session: dbSess })
                    const userUpdate = await userModel.updateOne(
                        {
                            _id:session4.metadata.userId
                        }, 
                        {
                            $inc: {
                                currencyAmt: requests
                            }
                        }, {
                            session: dbSess
                        }
                    )

                    if (userUpdate.modifiedCount !== 1) {
                        throw new Error('Transaction Failed! Unable to update user currencyAmt')
                    }

                    await dbSess.commitTransaction()
                    console.log('[Stripe webhook] New transaction committed to DB successfully')
                } catch (err) {
                    console.error(err)
                    await dbSess.abortTransaction()
                    return NextResponse.json({
                        message: `Error saving transaction to DB`
                    }, {
                        status: 500
                    })
                } finally {
                    dbSess.endSession()
                    console.log('DB Transaction Session ended.')
                }
                
                

            default:
                console.warn(event.type, 'Unhandled event type')
                break
        }
        return NextResponse.json({
            success: true
        })
    } catch (err) {
        console.error(err)
        return NextResponse.json({
            message: "Webhook handler failed."
        }, {
            status:400
        })
    }
}