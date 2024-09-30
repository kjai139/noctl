import { type Session } from 'next-auth'
import { TbPigMoney } from "react-icons/tb";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { FaMoneyBillTrendUp } from "react-icons/fa6";
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
                <div>
                    <TbPigMoney></TbPigMoney>
                    <span>{session.user.currencyAmt}</span>
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuLabel>
                    My Balance
                </DropdownMenuLabel>
                <DropdownMenuSeparator></DropdownMenuSeparator>
                <DropdownMenuGroup>
                    <DropdownMenuItem>
                        <FaMoneyBillTrendUp></FaMoneyBillTrendUp>
                        <span>Add currency</span>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}