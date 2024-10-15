'use client'
import { type Session } from 'next-auth'
import { TbPigMoney } from "react-icons/tb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Button } from '../ui/button';
import AddCurrencyDialog from '../dialog/addCurrencyDialog';
import { useEffect, useState } from 'react';
import { getStripe } from '@/lib/loadStripeClient';
import RedirectResultModal from '../dialog/redirectResult';
import { usePathname, useRouter } from 'next/navigation';
import { UpdateUserCurrency } from '@/app/_utils/updateUserCurrency';
import { useWorkState } from '@/app/_contexts/workStateContext';

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
    const [isRedirectSuccess, setIsRedirectSuccess] = useState(false)
    const [isInitiated, setIsInitiated] = useState(false)
    const [isResultLoading, setIsResultLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { userCurrency, setUserCurrency } = useWorkState()

    const handleItemClick = (e:any) => {
        e.preventDefault()
        setDropdownOpen(false)
        setTimeout(() => {
            setIsDialogOpen(true)
        }, 100)
      
    }

    useEffect(() => {
        if (!isResultOpen && isInitiated) {
            router.replace(pathname)
            console.log('pathname replaced.')
        }
    }, [isResultOpen])

    useEffect(() => {
        const handleRedirect = async () => {
            try {
                
                const stripe = await getStripe()
                const searchParams = new URLSearchParams(window.location.search)
                const clientSecret = searchParams.get('payment_intent_client_secret')
                console.log('PI CS :', clientSecret)
                if (clientSecret) {
                    setIsResultLoading(true)
                    setIsResultOpen(true)
                    setIsInitiated(true)
                    const response = await stripe.retrievePaymentIntent(clientSecret)

                    console.log(response)
                    if (response.paymentIntent.status === 'succeeded') {
                        setRedirectMsg('Your payment was successful.')
                        
                        setIsRedirectSuccess(true)
                    } else {
                        setRedirectMsg('Your payment was unsuccessful.')
                    }
                    setIsResultLoading(false)
                }   
            } catch (err) {
                console.error(err)
                setRedirectMsg('Error getting payment status')
                setIsResultLoading(false)
            }
        }

        handleRedirect()
    }, [])

    useEffect(() => {
        const getUserCurrency = async () => {
            if (!session.user.id) {
                console.log('[Get user currency] User ID missing.')
                return
            }
            try {
                const currencyAmt = await UpdateUserCurrency({
                    userId:session.user.id
                })

                if (currencyAmt === null) {
                    throw new Error(`Encountered a server error getting user's currency balance`)
                } else {
                    console.log('[Get User Currency]', currencyAmt)
                    setUserCurrency(currencyAmt)
                }


            } catch (err) {
                console.error(err)
            }
        }

        getUserCurrency()
    }, [])

    return (
        <>
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant={'outline'} className='flex gap-2 items-center'>
                    <TbPigMoney color='#AA336A' size={30}></TbPigMoney>
                    <span>{userCurrency !== null && userCurrency !== undefined ? userCurrency : 'Unavailable'}</span>
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
        <AddCurrencyDialog session={session} products={products} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}></AddCurrencyDialog>
        <RedirectResultModal isOpen={isResultOpen} setIsOpen={setIsResultOpen} isSuccess={isRedirectSuccess} resultMsg={redirectMsg}></RedirectResultModal>
        </>
    )
}