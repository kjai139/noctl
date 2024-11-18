'use server'
import connectToMongoose from "@/lib/mongoose"
import transactionModel from "../_models/transactionModel"


export default async function UpdateTransStatus (pId:string) {
    try {
        /* throw new Error('Testing Error') */
        await connectToMongoose()
        const existingTrans = await transactionModel.findOne({
            paymentId: pId
        })

        if (!existingTrans) {
            console.log(`[Update trans status] Could not locate pId${pId}`)
            throw new Error(`[Update trans status] Could not locate pId${pId}`)
        } else {
            if (existingTrans.status === 'incomplete') {
                existingTrans.status = 'pending'
                existingTrans.expiresAt = null
                await existingTrans.save()
                console.log(`[UpdateTransStatus] ${pId} status -> pending `)
            } else if (existingTrans.status === 'completed') {
                console.log(`[UpdateTransStatus] ${pId} status is already completed `)
                return
            }
        }

       
    } catch (err) {
        console.error(err)
        throw err
    }
}