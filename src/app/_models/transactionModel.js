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
        enum: ['incomplete','pending', 'completed', 'cancelled'],
        default:'incomplete'
    },
    productName: {
        type:String,

    },
    productDesc: {
        type:String
    },
    expiresAt: {
        type:Date,
        default: null
    },
    statusVerified: {
        type:Boolean,
        default:false
    },
}, {
    timestamps: true
})

/* TransactionModel.index({createdAt: 1}, {expireAfterSeconds: 7884000}) */

TransactionModel.index({expiresAt: 1}, {
    expireAfterSeconds: 0
})


export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionModel)