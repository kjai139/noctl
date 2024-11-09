'use server'
import connectToMongoose from "@/lib/mongoose"
import transactionModel from "../_models/transactionModel"


export default async function UpdateTransStatus (pId:string) {
    try {
        await connectToMongoose()
        const existingTrans = await transactionModel.findOne({
            paymentId: pId
        })

        if (existingTrans && existingTrans.status === 'incomplete') {
            existingTrans.status = 'pending'
            existingTrans.expiresAt = null
            await existingTrans.save()
        } else {
            console.log(`[Update trans status] Could not locate pId${pId}`)
        }
    } catch (err) {
        console.error(err)
    }
}