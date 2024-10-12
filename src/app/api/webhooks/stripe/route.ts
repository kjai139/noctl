import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import stripe from '@/lib/stripe'

export async function POST (req:NextRequest) {
    const body = await req.text()
    const sig = req.headers.get('stripe-signature')

    let event: Stripe.Event
    try {
        event = stripe.webhooks.constructEvent(body, sig as string, process.env.STRIPE_WEBHOOK_LOCAL_SECRET as string)
        console.log('[Stripe] Listening to Webhook events')
    } catch (err) {
        console.error(err)
        return NextResponse.json({
            message: `Stripe Webhook Error: ${(err as Error).message}`
        }, {
            status: 400
        })
    }

    try {
        switch (event.type) {
            case "checkout.session.async_payment_succeeded":
                const session = event.data.object
                console.log('[Stripe webhook async payment completed] Session -', session)
                break
            case "checkout.session.async_payment_failed":
                const session2 = event.data.object
                console.log('[Stripe webhook payment failed] Session - ', session2)
                break
            case "checkout.session.completed":
                const session3 = event.data.object
                console.log('[Stripe webhook payment completed]', session3)
                break
            default:
                console.warn(event.type, 'Unhandled event type')
                break
        }
    } catch (err) {
        console.error(err)
        return NextResponse.json({
            message: "Webhook handler failed."
        }, {
            status:400
        })
    }
}