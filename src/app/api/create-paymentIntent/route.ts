import userModel from "@/app/_models/userModel";
import connectToMongoose from "@/lib/mongoose";
import stripeInstance from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";
import Stripe from 'stripe'
import { auth } from "../../../../auth";

const getProductDetail = async (itemId: string) => {
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


export async function POST(request: NextRequest) {
    const item = await request.json()
    
    //Database connection issue on signIn
    const session = await auth()
    console.log('[Stripe create paymentIntent] user Id:', session?.user.id)
    if (!session || !session.user.id || !session.user.email) {
        return NextResponse.json({
            message: 'Account error, please try to re-log.'
        }, {
            status: 503
        })
    }




    console.log('[Stripe create pi] User Id Found. Checking server status...')
    try {
        await connectToMongoose()
        const existingUser = await userModel.findById(session.user.id)
        if (!existingUser) {
            return NextResponse.json({
                message: 'Encountered a server error. Please try again later.'
            }, {
                status: 500
            })
        }
    } catch (err) {
        console.error(err)
        console.log('[Stripe Creating PaymentIntent] Encountered a server error, please try again later.')
        return NextResponse.json({
            message: 'Encountered a server error. Please try again later.'
        }, {
            status: 500
        })
    }

    try {
        const product = await stripeInstance.products.retrieve(item.id, {
            expand: ['default_price']
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
            receipt_email: session.user.email,
            description: `Purchase of ${product.name}`,
            metadata: {
                userId: session.user.id
            },
            payment_method_types: ['card', 'link']
        })
        console.log('ITEM ******', item)
        console.log('PRODUCT*******', product)

        return NextResponse.json({
            amount: unitPrice,
            currency: currency,
            productName: product.name,
            productDesc: product.description,
            pId: paymentInt.id,
            clientSecret: paymentInt.client_secret,
            userId: paymentInt.metadata.userId,
            dpmCheckerLink: `https://dashboard.stripe.com/settings/payment_methods/review?transaction_id=${paymentInt.id}`,
        })
    } catch (err) {
        console.error(err)
        console.log('[Stripe Creating PaymentIntent] Encountered a server error, please try again later.')
        return NextResponse.json({
            message: 'Encountered a server error. Please try again later.'
        }, {
            status: 500
        })
    }

}