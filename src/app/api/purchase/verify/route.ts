import { NextRequest, NextResponse } from "next/server";
import stripeInstance from "@/lib/stripe";
import connectToMongoose from "@/lib/mongoose";
import transactionModel from "@/app/_models/transactionModel";
import { auth } from "../../../../../auth";
import mongoose from "mongoose";

export async function POST (req:NextRequest) {

    
    const body = await req.json()
    
    const pId = body.pId
    if (!pId) {
        return NextResponse.json({
            message: 'Invalid Request'
        }, {
            status:500
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
                status:500
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
                updatedTrans: existingTrans
            })


            
        } else if (paymentIntent.status === 'succeeded') {
            console.log('[purchase/verify API] payment was success.')
            if (existingTrans.status === 'completed') {
                return NextResponse.json({
                    updatedTrans: existingTrans
                })
            }
            if (existingTrans.status === 'pending' || existingTrans.status === 'incomplete') {
                const session = await mongoose.startSession()
                try {
                    
                    session.startTransaction()
                    //todo



                } catch (err) {

                }
                existingTrans.status = 'completed'
                existingTrans.statusVerified = true
                existingTrans.expiresAt = null
                await existingTrans.save()
                return NextResponse.json({
                    updatedTrans: existingTrans
                })
            }
            
        }
        

    } catch (err) {
        console.error(err)
        if (err instanceof Error) {
            return NextResponse.json({
                message: err.message
            }, {
                status:500
            })
        }
        
    }


}