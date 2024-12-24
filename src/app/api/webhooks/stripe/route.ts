import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import stripe from '@/lib/stripe'
import connectToMongoose from "@/lib/mongoose";
import TransactiionModel from '@/app/_models/transactionModel'
import mongoose from 'mongoose'
import userModel from "@/app/_models/userModel";

export async function POST(req: NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')
    const ngrokSecret = 'whsec_8D8TLuk9MTqS6dnsqVP7HphHnbx0i6KJ'
    const endpointSecret = process.env.STRIPE_WEBHOOK_LOCAL_SECRET
    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig as string, ngrokSecret as string)
        
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
            throw err
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

                console.log(`[Stripe webhook] Checking if event ID ${event.id} exists`)

                let requests
                switch (session4.amount) {
                    case 500:
                        requests = 100
                        console.log('[Stripe Webhook] Adding 100 request credits...')
                        break
                    case 1000:
                        requests = 200
                        console.log('[Stripe Webhook] Adding 200 request credits...')
                        break
                    case 2000:
                        requests = 425
                        console.log('[Stripe Webhook] Adding 425 request credits...')
                        break
                    default:
                        console.log('[Stripe Webhook] Unhandled currency amount detected:', session4.amount)
                        throw new Error('Unhandled currency amount')
                }

                const existingTransaction = await TransactiionModel.findOne({
                    paymentId: session4.id
                })

                //Pending Transaction found
                if (existingTransaction) {
                    //if event already happened
                    if (existingTransaction.eventId && existingTransaction.eventId === event.id) {
                        console.log(`[Stripe Webhook] Transaction already processed eventId: ${existingTransaction.eventId}`)

                        return NextResponse.json({
                            success: true
                        })
                    } else if (existingTransaction.status === 'completed') {
                        console.log(`[Stripe Webhook] Transaction status is already completed`)
                        return NextResponse.json({
                            success: true
                        })
                    } else {
                        /* if (existingTransaction.statusVerified) {
                            console.log('[Stripe Webhook] New Event but statusVerified')

                            return NextResponse.json({
                                success:true
                            })
                        } */
                        //New event
                        console.log(`[Stripe Webhook] New payment succeed Event ${event.id}`)
                        console.log(`[Stripe Webhook] Transaction status: ${existingTransaction.status}`)

                        //if names and amount did not match
                        if (existingTransaction.userId.toString() !== session4.metadata.userId || existingTransaction.amount !== session4.amount) {
                            console.log(`[Stripe Webhook] ${existingTransaction.paymentId} ***user or amount did not match***`)
                            existingTransaction.amount = session4.amount
                            existingTransaction.userId = session4.metadata.userId
                            
                        }
                        existingTransaction.eventId = event.id
                        console.log(`[Stripe Webhook] EventId updated`)
                        existingTransaction.status = 'completed'
                        existingTransaction.expiresAt = null

                        const dbSess = await mongoose.startSession()
                        dbSess.startTransaction()


                        try {
                            await existingTransaction.save({
                                session: dbSess
                            })
                            console.log('[Stripe webhook] Trasnaction updated to completed')

                            const userUpdate = await userModel.updateOne(
                                {
                                    _id: session4.metadata.userId
                                },
                                {
                                    $inc: {
                                        currencyAmt: requests
                                    }
                                }, {
                                session: dbSess
                            }
                            )
                            console.log('[Stripe webhook] User currency updated')

                            if (userUpdate.modifiedCount !== 1) {
                                throw new Error('Transaction Failed! Unable to update user currencyAmt')
                            }

                            await dbSess.commitTransaction()
                            console.log('[Stripe webhook] Pending Transaction -> Complete')
                            return NextResponse.json({
                                success:true
                            })
                            

                        } catch (err) {
                            console.error(err)
                            await dbSess.abortTransaction()
                            console.log('[Stripe webhook] Error updating database, transaction aborted')
                            return NextResponse.json({
                                message: '[Stripe webhook] Error updating database, transaction aborted'
                            }, {
                                status: 500
                            })
                        } finally {
                            dbSess.endSession()
                            console.log('DB Transaction Session ended.')
                        }

                    }

                } else {
                    //Pending Transaction not found in DB
                    console.log(`[Stripe Webhook] Transaction not found, creating transaction for eventId ${event.id}...`)
                    let productName
                    if (session4.amount === 500) {
                        productName = '100 requests'
                    } else if (session4.amount === 1000) {
                        productName = '200 requests'
                    } else if (session4.amount === 2000) {
                        productName = '425 requests'
                    } else {
                        productName = 'N/A'
                    }
                    const dbSess = await mongoose.startSession()
                    dbSess.startTransaction()
                    try {

                        const newTransaction = new TransactiionModel({
                            paymentId: session4.id,
                            userId: session4.metadata.userId,
                            amount: session4.amount,
                            transactionType: 'purchase',
                            eventId: event.id,
                            status: 'completed',
                            productName: productName,
                            expiresAt: null

                        })


                        await newTransaction.save({ session: dbSess })
                        const userUpdate = await userModel.updateOne(
                            {
                                _id: session4.metadata.userId
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
                        console.log(`[Stripe webhook] New transaction pId ${session4.id} committed to DB successfully`)
                        console.log('[Stripe webhook] Returning a success response.')
                        return NextResponse.json({
                            success: true
                        })
                    } catch (err) {
                        console.error(err)
                        await dbSess.abortTransaction()
                        console.log(`[Stripe Webhook ${event.id}] Transaction aborted. Returned 500`)
                        return NextResponse.json({
                            message: `Error saving transaction to DB`
                        }, {
                            status: 500
                        })
                    } finally {
                        dbSess.endSession()
                        console.log('DB Transaction Session ended.')
                    }
                }




            default:
                console.warn(event.type, 'Unhandled event type')
                break
        }
        console.log(`[Stripe webhook ${event.id}] Returning a success response At the end.`)
        return NextResponse.json({
            success: true
        })

    } catch (err) {
        console.error(err)
        console.log('[Stripe webhook] Webhook handler failed. returned 400')
        return NextResponse.json({
            message: "Webhook handler failed."
        }, {
            status: 400
        })
    }
}