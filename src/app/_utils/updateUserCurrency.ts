"use server"
import connectToMongoose from "@/lib/mongoose";
import userModel from "../_models/userModel";
import { auth } from "../../../auth";



export async function UpdateUserCurrency () {
    try {
        const session = await auth()
        if (!session || !session.user.id) {
            throw new Error('Encountered an authentication error, please try relogging')
        }
        const userId = session.user.id
        await connectToMongoose()
        const existingUser = await userModel.findById(userId)
        if (!existingUser) {
            console.error('[Update User Currency] User does not exist in database.')
            throw new Error('User does not exist in database.')
        }
        return existingUser.currencyAmt
    } catch (err) {
        console.error('[Update User Currency] ', err)
        return null
    }
}

