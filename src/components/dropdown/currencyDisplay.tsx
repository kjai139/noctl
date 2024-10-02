'use client'
import { type Session } from 'next-auth'
import { TbPigMoney } from "react-icons/tb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Button } from '../ui/button';
import AddCurrencyDialog from '../dialog/addCurrencyDialog';
import { useState } from 'react';
interface CurrencyDisplayProps {
    session: Session | null
}

export default function CurrencyDisplay ({session}:CurrencyDisplayProps) {

    if (!session || !session.user) {
        return null
    }

    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const handleItemClick = (e:any) => {
        e.preventDefault()
        setDropdownOpen(false)
        setTimeout(() => {
            setIsDialogOpen(true)
        }, 100)
      
    }

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
        <AddCurrencyDialog isDialogOpen={isDialogOpen} setIsDialogOpen={setIsDialogOpen}></AddCurrencyDialog>
        </>
    )
}