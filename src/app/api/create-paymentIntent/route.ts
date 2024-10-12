import userModel from "@/app/_models/userModel";
import connectToMongoose from "@/lib/mongoose";
import stripeInstance from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe'

const getProductDetail = async (itemId:string) => {
    try {
        const product = await stripeInstance.products.retrieve(itemId, {
            expand: ['data.default_price']
        })

        const price = product.default_price
        console.log('price:', price, product)
        return price
    } catch (err) {
        console.error(err)
    }
    
}


export async function POST(request:NextRequest) {
    const item  = await request.json()
    console.log('[Stripe create paymentIntent] user Id:', item.userId)
    //Database connection issue on signIn
    
    if (!item.userId) {
        /* console.log('User is not logged in, checking database...')
        await connectToMongoose()
        const existingUser = await userModel.findOne({
            email: item.userEmail
        }) */
       console.log('[Stripe create pi] User Id from DB missing...')
        return NextResponse.json({
            message: 'Account error, please try relogging.'
        }, {
            status:503
        })

    }
    const product = await stripeInstance.products.retrieve(item.id, {
        expand:['default_price']
    })
    if (!product) {
        throw new Error('Product is null/undefined')
    }
    const priceObj = product.default_price as Stripe.Price
    const unitPrice = priceObj.unit_amount!
    const currency = priceObj.currency

    

    const paymentInt = await stripeInstance.paymentIntents.create({
        amount: unitPrice,
        currency: currency,
        metadata: {
            userId: item.userId
        }
    })
   console.log('ITEM ******', item)
   console.log('PRODUCT*******', product)

   return NextResponse.json({
        amount: unitPrice,
        currency:currency,
        productName: product.name,
        productDesc: product.description,
        pId: paymentInt.id,
        clientSecret:  paymentInt.client_secret,
        userId: paymentInt.metadata.userId,
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentInt.id}`,
   })
}