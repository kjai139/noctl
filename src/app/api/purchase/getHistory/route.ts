import { NextRequest, NextResponse } from "next/server"
import { auth } from "../../../../../auth"
import userModel from "@/app/_models/userModel"
import transactionModel from "@/app/_models/transactionModel"


export async function GET(request:NextRequest) {
    try {
        const session = await auth()
        if (!session || !session.user.id) {
            return NextResponse.json({
                message: 'User is not logged in.'
            }, {
                status: 500
            })
        }

        const existingUserTrans = await transactionModel.find({
            userId: session.user.id,
            $or: [
                {
                    status: 'pending'
                },
                {
                    status:'completed'
                }
            ]
        }).sort({
            createdAt: -1
        })

        return NextResponse.json({
            trans: existingUserTrans
        })

    } catch (err) {
        console.error(err)
    }
}