const mongoose = require('mongoose')
const Schema = mongoose.Schema



const UserModel = new Schema({
    name: {
        type:String,
        unique:true,
    },
    email: {
        type:String,
        required:true,
        unique:true
    },
    currencyAmt: {
        type:Number,
        default: 10
    }
})


export default mongoose.models.User || mongoose.model('User', UserModel)