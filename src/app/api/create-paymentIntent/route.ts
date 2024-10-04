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
        currency: currency
    })
   console.log('ITEM ******', item)
   console.log('PRODUCT*******', product)

   return NextResponse.json({
        clientSecret:  paymentInt.client_secret,
        dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentInt.id}`,
   })
}