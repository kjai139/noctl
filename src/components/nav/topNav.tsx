import { auth } from "../../../auth";
import SignInBtn from "../buttons/signInBtn";
import CurrencyDisplay from "../dropdown/currencyDisplay";
import stripeInstance from '../../lib/stripe'
import ModelsDialog from "../dialog/modelsDialog";
import siteLogo from '../../../public/mmtlicon.png'
import Image from "next/image";

async function getProductList () {
    try {
        const products = await stripeInstance.products.list({
            expand:['data.default_price']
        })

        if (products) {
            return products
        } else {
            return null
        }
    } catch (err) {
        console.error('Error getting products', err)
        return null
    }
}

export default async function TopNav() {
    const products = await getProductList()
    console.log('Products from stripe:', products)
    let plainProducts
    if (products && products.data) {
        plainProducts = products.data.map((node) => {
            return {
                id:node.id,
                defaultPrice: node.default_price,
                images: node.images,
                name:node.name,
                description: node.description
            }

        })
    }
    console.log('plainproducts', plainProducts)
    const session = await auth()

    return (
        <nav className="flex w-full shadow p-4 justify-center items-center">
            <div className="mw w-full flex gap-2 sm:gap-8 justify-between items-center">
                <div className="flex items-center gap-2">
                <Image src={siteLogo} height={30} width={30} alt="Site logo">

                </Image>
                <div className="font-semibold text-xl hidden sm:block">
                    
                    MMTL
                </div>
                </div>
                <div className="flex gap-4">
                    <div>
                        <ModelsDialog></ModelsDialog>
                    </div>
                </div>
                
                <div className="flex gap-8 items-center">
                    <CurrencyDisplay products={plainProducts} session={session}></CurrencyDisplay>
                    <SignInBtn session={session}></SignInBtn>

                </div>
            </div>
        </nav>
    )
}