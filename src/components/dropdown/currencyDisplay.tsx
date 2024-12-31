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
import { TbHexagonLetterRFilled } from "react-icons/tb";
import { useWorkState } from '@/app/_contexts/workStateContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

import { BsReceipt } from "react-icons/bs";
import { TbCircleLetterRFilled } from "react-icons/tb";
import PurchaseHistoryDialog from '../dialog/purchaseHistoryDialog';
import ErrorResultAlert from '../dialog/errorResult';

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
    const [isPhOpen, setIsPhOpen] = useState(false)
    const [redirectMsg, setRedirectMsg] = useState('')
    const [isResultOpen, setIsResultOpen] = useState(false)
    const [isRedirectSuccess, setIsRedirectSuccess] = useState(false)
    const [isInitiated, setIsInitiated] = useState(false)
    const [isResultLoading, setIsResultLoading] = useState(false)
    const router = useRouter()
    const pathname = usePathname()
    const { userCurrency, setUserCurrency } = useWorkState()
    const [errorMsg, setErrorMsg] = useState('')

    const [hasMounted, setHasMounted] = useState(false)

    const handleItemClick = (e:any) => {
        e.preventDefault()
        setDropdownOpen(false)
        setTimeout(() => {
            setIsDialogOpen(true)
        }, 100)
      
    }

    const getUserCurrency = async () => {
        if (!session.user.id) {
            console.log('[Get user currency] User ID missing.')
            setUserCurrency(null)
            return null
        }
        try {
            const currencyAmt = await UpdateUserCurrency()           
            console.log('[Get User Currency]', currencyAmt)
            setUserCurrency(currencyAmt)
            


        } catch (err) {
            console.error(err)
            setUserCurrency(null)
            if (err instanceof Error) {
                setErrorMsg(err.message)
            } else {
                setErrorMsg('Encountered an unexpected error while retrieving your balance.')
            }
        }
    }

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

    useEffect(() => {
        if (!isResultOpen && isInitiated) {
            router.replace(pathname)
            console.log('pathname replaced.')
        }
    }, [isResultOpen])

    useEffect(() => {

        handleRedirect()
    }, [])

    /* useEffect(() => {

        getUserCurrency()
    }, []) */

    useEffect(() => {
        if (isDialogOpen === false && hasMounted) {
            console.log('[UseEffect getUserCurrency ran]')
            getUserCurrency()
        } else {
            console.log('has mounted to true')
            setHasMounted(true)
        }
    }, [isDialogOpen, hasMounted])

    const handleSelectItem = (idx:number) => {

        switch (idx) {
            case 0:
                setIsDialogOpen(true)
                break
            case 1:
                setIsPhOpen(true) 
                break
            default:
                console.error('Unhandled menu select item')
                break
        }
       
        setDropdownOpen(false)
    }

    return (
        <>
        
        <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
            
                <Tooltip>
                    <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <Button variant={'ghost'} className='flex gap-1 items-center border-0 shadow-none hover:border-1 hover:shadow currencyBtn hover:brightness-90'>
                            {/* <TbHexagonLetterRFilled size={30} /> */}
                            <TbCircleLetterRFilled size={30}></TbCircleLetterRFilled>
                            <span className='text-lg text-foreground'>{userCurrency !== null && userCurrency !== undefined ? userCurrency : 'N/A'}</span>
                        </Button>
                    </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>Currency tab</p>
                    </TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    My Balance
                </DropdownMenuLabel>
                <DropdownMenuSeparator></DropdownMenuSeparator>
                <DropdownMenuGroup>
                    <DropdownMenuItem className='flex gap-2 items-center hover:cursor-pointer hover:bg-muted' onSelect={() => handleSelectItem(0)}>
                    <FaMoneyBillTrendUp></FaMoneyBillTrendUp>
                    <span>Add Request Currency</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem className='flex gap-2 items-center hover:cursor-pointer hover:bg-muted' onSelect={() => handleSelectItem(1)}>
                    <BsReceipt></BsReceipt>
                    <span>Purchase History</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
        <AddCurrencyDialog session={session} products={products} isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}></AddCurrencyDialog>
        <PurchaseHistoryDialog isDialogOpen={isPhOpen} onOpenChange={setIsPhOpen}></PurchaseHistoryDialog>
        <RedirectResultModal isOpen={isResultOpen} setIsOpen={setIsResultOpen} isSuccess={isRedirectSuccess} resultMsg={redirectMsg}></RedirectResultModal>
        <ErrorResultAlert errorMsg={errorMsg} setErrorMsg={setErrorMsg}></ErrorResultAlert>
        </>
    )
}