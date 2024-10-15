"use server"
import connectToMongoose from "@/lib/mongoose";
import userModel from "../_models/userModel";

interface UpdateUserCurrencyProps {
    userId: string
}

export async function UpdateUserCurrency ({userId}:UpdateUserCurrencyProps) {
    try {
        await connectToMongoose()
        const existingUser = await userModel.findById(userId)
        if (!existingUser) {
            console.error('[Update User Currency] User does not exist in database.')
            throw new Error('User does not exist in database.')
        }
        return existingUser.currencyAmt
    } catch (err) {
        console.error('Error getting User', err)
        return null
    }
}