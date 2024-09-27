import SignInBtn from "../buttons/signInBtn";


export default function TopNav() {


    return (
        <nav className="flex w-full shadow p-4 justify-center">
            <div className="mw w-full flex gap-8 justify-between items-center">
                <div className="font-semibold">
                    MMTL
                </div>
                <div className="flex">
                    
                </div>
                <div>
                    <SignInBtn></SignInBtn>

                </div>
            </div>
        </nav>
    )
}