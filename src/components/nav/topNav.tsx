import { auth } from "../../../auth";
import SignInBtn from "../buttons/signInBtn";
import CurrencyDisplay from "../dropdown/currencyDisplay";


export default async function TopNav() {

    const session = await auth()

    return (
        <nav className="flex w-full shadow p-4 justify-center">
            <div className="mw w-full flex gap-8 justify-between items-center">
                <div className="font-semibold text-lg">
                    MMTL
                </div>
                <div className="flex">
                    
                </div>
                <div className="flex gap-8 items-center">
                    <CurrencyDisplay session={session}></CurrencyDisplay>
                    <SignInBtn session={session}></SignInBtn>

                </div>
            </div>
        </nav>
    )
}