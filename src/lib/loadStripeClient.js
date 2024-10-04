import { loadStripe } from '@stripe/stripe-js'


let stripePromise

export const getStripe = async () => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
        console.error('STRIPB PUBLISHABLE KEY MISSING')
    } else {
        if (!stripePromise) {
            stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
            
        } 
        return stripePromise
    }
}
