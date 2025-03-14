
import SignInBtn from "../buttons/signInBtn";
import CurrencyDisplay from "../dropdown/currencyDisplay";
import ModelsDialog from "../dialog/modelsDialog";
import siteLogo from '../../../public/mmtlicon.png'
import Image from "next/image";
import { type Session } from "next-auth";
import NavsideBarButton from "../buttons/navSidebarBtn";

interface TopNavProps {
    products: any,
    session: Session | null
}

export default async function TopNav({ products, session }: TopNavProps) {


    return (
        <nav className="flex w-full z-10 shadow p-4 justify-center items-center sticky left-0 top-0 bg-background">
            <div className="w-full flex gap-2 sm:gap-8 justify-between items-center">
                <div className="flex items-center gap-2">
                    <NavsideBarButton></NavsideBarButton>
                    <Image src={siteLogo} height={30} width={30} alt="Site logo">

                    </Image>
                    <div className="flex gap-4 items-center">
                        <div className="font-semibold text-lg hidden sm:block leading-none">
                            MachinaX
                        </div>
                        <div>
                            <ModelsDialog></ModelsDialog>
                        </div>
                    </div>
                    </div>
                    {/* <div className="flex gap-4">

                    </div> */}

                    <div className="flex sm:gap-8 gap-1 items-center">
                        <CurrencyDisplay products={products} session={session}></CurrencyDisplay>
                        <SignInBtn session={session}></SignInBtn>

                    </div>
                </div>
        </nav>
    )
}