import { type Session } from 'next-auth'
import { TbPigMoney } from "react-icons/tb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { Button } from '../ui/button';
interface CurrencyDisplayProps {
    session: Session | null
}

export default function CurrencyDisplay ({session}:CurrencyDisplayProps) {

    if (!session || !session.user) {
        return null
    }

    return (
        <DropdownMenu>
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
                    <DropdownMenuItem className='flex gap-2 items-center'>
                        <FaMoneyBillTrendUp></FaMoneyBillTrendUp>
                        <span>Add currency</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}