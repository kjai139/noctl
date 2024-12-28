import Image from "next/image"
import siteLogo from '../../public/mmtlicon.png'
export default function Loading() {

    return (
        <div className="items-center justify-center h-screen w-full flex">
            <div className="icon-load">
                <Image src={siteLogo} height={80} width={80} alt="Site logo"></Image>
            </div>
        </div>
    )
}