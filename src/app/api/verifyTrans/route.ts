import transactionModel from "@/app/_models/transactionModel";
import connectToMongoose from "@/lib/mongoose";
import stripeInstance from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic'

export async function POST (request:NextRequest) {
    try {
        await connectToMongoose()
        const pendingTrans = await transactionModel.find({
            status: 'pending',
            statusVerified: false,
            createdAt: {
                $lt: new Date(Date.now() - 15 * 60 * 1000)
            }
        })

        for (const trans of pendingTrans) {
            const paymentIntent = await stripeInstance.paymentIntents.retrieve(trans.pId)
            if (paymentIntent.status === 'succeeded') {
                trans.status = 'completed'
                trans.expiresAt = null
                console.log(`[VerifyTrans] Unresolved pId:${trans.pId} set to complete.`)
            }
            trans.statusVerified = true
            await trans.save()
            console.log(`[VerifyTrans] Unresolved pId:${trans.pId} verified and saved.`)
        }

        return NextResponse.json({
            message: '[VerifyTrans] Verify Trans Complete.'
        })

    } catch (err) {
        console.error(err)
        return NextResponse.json({
            message: '[VerifyTrans] Error running Verify Trans. Check Logs'
        }, {
            status: 500
        })
    }
}