import { string } from 'zod'

const mongoose = require('mongoose')
const Schema = mongoose.Schema


const TransactionModel = new Schema({
    userId: {
        type:Schema.ObjectId,
        ref:'User'
    },
    eventId: {
        type:String,
        unique:true,
    },
    amount: {
        type:Number,
        required:true
    },
    transactionType: {
        type:String,
        enum: ['purchase', 'refund'],
        required:true
    },
    paymentId: {
        type:String,
        unique:true,
        required: true,
    },
    status: {
        type:String,
        enum: ['pending', 'completed'],
        default:'pending'
    },
    productName: {
        type:String,

    },
    productDesc: {
        type:String
    }
}, {
    timestamps: true
})

/* TransactionModel.index({createdAt: 1}, {expireAfterSeconds: 7884000}) */


export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionModel)