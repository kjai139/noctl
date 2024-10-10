'use client'
import { type Session } from 'next-auth'
import { TbPigMoney } from "react-icons/tb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Button } from '../ui/button';
import AddCurrencyDialog from '../dialog/addCurrencyDialog';
import { useEffect, useState } from 'react';
import { getStripe } from '@/lib/loadStripeClient';
interface CurrencyDisplayProps {
    session: Session | null,
    products: any
}

export default function CurrencyDisplay ({session, products}:CurrencyDisplayProps) {

    if (!session || !session.user) {
        return null
    }

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [redirectMsg, setRedirectMsg] = useState('')
    const [isResultOpen, setIsResultOpen] = useState(false)

    const handleItemClick = (e:any) => {
        e.preventDefault()
        setDropdownOpen(false)
        setTimeout(() => {
            setIsDialogOpen(true)
        }, 100)
      
    }

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                const stripe = await getStripe()
                const searchParams = new URLSearchParams(window.location.search)
                const clientSecret = searchParams.get('payment_intent_client_secret')
                console.log('PI CS :', clientSecret)
                if (clientSecret) {
                    const response = await stripe.retrievePaymentIntent(clientSecret)

                    console.log(response)
                    if (response.status === 'succeeded') {
                        setRedirectMsg('Your payment was successful.')
                    } else {
                        setRedirectMsg('Your payment was unsuccessful.')
                    }
                }   
            } catch (err) {
                console.error(err)
                setRedirectMsg('Error getting payment status')
            }
        }

        handleRedirect()
    }, [])

    return (
        <>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className='flex gap-2 items-center'>
                    <TbPigMoney color='#AA336A' size={30}></TbPigMoney>
                    <span>{session.user.currencyAmt}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    My Balance
                </DropdownMenuLabel>
                <DropdownMenuSeparator></DropdownMenuSeparator>
                <DropdownMenuGroup>
                    <DropdownMenuItem className='flex gap-2 items-center' onSelect={() => setIsDialogOpen(true)}>
                    <FaMoneyBillTrendUp></FaMoneyBillTrendUp>
                    <span>Add currency</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <AddCurrencyDialog products={products} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}></AddCurrencyDialog>
        </>
    )
}