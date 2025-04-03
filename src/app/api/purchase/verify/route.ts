import { NextRequest, NextResponse } from "next/server";
import stripeInstance from "@/lib/stripe";
import connectToMongoose from "@/lib/mongoose";
import transactionModel from "@/app/_models/transactionModel";
import { auth } from "../../../../../auth";
import mongoose from "mongoose";
import userModel from "@/app/_models/userModel";
import { fiveDollarCurAmt, tenDollarsCurAmt, twentyDollarCurAmt } from "@/lib/currencyPrice";

export async function POST(req: NextRequest) {


    const body = await req.json()

    const pId = body.pId
    if (!pId) {
        return NextResponse.json({
            message: 'Invalid Request'
        }, {
            status: 500
        })
    }
    try {
        const session = await auth()
        if (!session || !session.user.id) {
            return NextResponse.json({
                message: 'User is not logged in.'
            }, {
                status: 500
            })
        }
        await connectToMongoose()
        const paymentIntent = await stripeInstance.paymentIntents.retrieve(pId)
        const existingTrans = await transactionModel.findOne({
            paymentId: pId
        })
        console.log('[purchase/verify API]', pId, paymentIntent.status)
        if (!existingTrans) {
            return NextResponse.json({
                message: 'Invalid payment ID'
            }, {
                status: 500
            })
        }

        if (!(paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
            console.log('[purchase/verify API] status is not successful or processing.')

            const cancelledPayment = await stripeInstance.paymentIntents.cancel(pId)
            console.log('[verifyPayment] cancel')
            existingTrans.statusVerified = true
            existingTrans.status = 'cancelled'
            await existingTrans.save()
            return NextResponse.json({
                updatedTrans: existingTrans,
                message: `paymentId ${pId} cancelled`
            })



        } else if (paymentIntent.status === 'succeeded') {
            console.log('[purchase/verify API] stripe payment was success.')
            if (existingTrans.status === 'completed') {
                return NextResponse.json({
                    updatedTrans: existingTrans,
                    message: 'Transaction status already completed.'
                })
            } else if (existingTrans.status === 'pending' || existingTrans.status === 'incomplete') {
                const mongoSession = await mongoose.startSession()
                try {

                    mongoSession.startTransaction()
                    //todo
                    const transaction = await transactionModel.findOne({
                        paymentId: pId
                    })

                    transaction.status = 'completed'
                    transaction.expiresAt = null
                    let requests
                    switch (transaction.amount) {
                        case 500:
                            requests = fiveDollarCurAmt
                            console.log('[VerifyTrans] Adding 100 request credits...')
                            break
                        case 1000:
                            requests = tenDollarsCurAmt
                            console.log('[VerifyTransk] Adding 200 request credits...')
                            break
                        case 2000:
                            requests = twentyDollarCurAmt
                            console.log('[VerifyTrans] Adding 425 request credits...')
                            break
                        default:
                            console.log('[VerifyTrans] Unhandled currency amount detected:', transaction.amount)
                            throw new Error('Unhandled currency amount')
                    }
                    await transaction.save({
                        session: mongoSession
                    })
                    const userUpdate = await userModel.updateOne(
                        {
                            _id: session.user.id
                        },
                        {
                            $inc: {
                                currencyAmt: requests
                            }
                        }, {
                        session: mongoSession
                    })

                    if (userUpdate.modifiedCount !== 1) {
                        throw new Error('user update failed.')
                    }

                    mongoSession.commitTransaction()

                    return NextResponse.json({
                        updatedTrans: transaction,
                        message: `transaction pId${pId} updated`

                    })



                } catch (err) {
                    console.log('[apiVerify] Error:', err)
                    mongoSession.abortTransaction()
                    throw err
                } finally {
                    mongoSession.endSession()
                }
                
                
            }

        }


    } catch (err) {
        console.error(err)
        if (err instanceof Error) {
            return NextResponse.json({
                message: err.message
            }, {
                status: 500
            })
        }

    }


}