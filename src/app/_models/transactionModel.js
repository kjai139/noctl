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
        required: true,
    }
}, {
    timestamps: true
})


export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionModel)