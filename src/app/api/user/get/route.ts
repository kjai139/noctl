import userModel from "@/app/_models/userModel";
import connectToMongoose from "@/lib/mongoose";
import { NextRequest, NextResponse } from "next/server";



export async function GET (req:NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const emailParams = searchParams.get('email')
    if (!emailParams) {
        return NextResponse.json({
            message: 'Invalid request.'
        }, {
            status:500
        })
    }
    const email = decodeURIComponent(emailParams)

    try {
        await connectToMongoose()
        const existingUser = await userModel.find({
            email:email
        })
        if (!existingUser) {
            const newUser = new userModel({
                email:email,

            })
            await newUser.save()
            return NextResponse.json({
                userId: newUser._id
            })
        } 
        return NextResponse.json({
            userId: existingUser[0]._id
        })

        

    } catch (err) {
        console.error('[Api/user/get] Error : ', err)
        return NextResponse.json({
            message: 'Encountered a server error'
        }, {
            status: 500
        })
    }
}