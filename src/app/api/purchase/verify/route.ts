import { NextRequest, NextResponse } from "next/server";
import stripeInstance from "@/lib/stripe";
import connectToMongoose from "@/lib/mongoose";
import transactionModel from "@/app/_models/transactionModel";

export async function GET (req:NextRequest) {

    const searchParams = req.nextUrl.searchParams
    const pId = searchParams.get('pId')
    if (!pId) {
        return NextResponse.json({
            message: 'Invalid Request'
        }, {
            status:500
        })
    }
    try {
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
            console.log('[purchase/verify API] status is not suceed or processing.')
            
            const cancelledPayment = await stripeInstance.paymentIntents.cancel(pId)
            existingTrans.statusVerified = true
            existingTrans.status = 'cancelled'
            await existingTrans.save()
            return NextResponse.json({
                updated:true,
                updatedTrans: existingTrans
            })


            
        } else if (paymentIntent.status === 'succeeded') {
            console.log('[purchase/verify API] payment was success.')
            if (existingTrans.status === 'completed') {
                return NextResponse.json({
                    updated: false
                })
            }
            if (existingTrans.status === 'pending' || existingTrans.status === 'incomplete') {
                existingTrans.status = 'completed'
                existingTrans.statusVerified = true
                existingTrans.expiresAt = null
                await existingTrans.save()
                return NextResponse.json({
                    updated:true,
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