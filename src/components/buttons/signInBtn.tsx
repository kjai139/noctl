
import { auth, signIn } from "../../../auth";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaUserCircle } from "react-icons/fa";
import GoogleSignInBtn from "./googleSignInBtn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import GoogleSignOutBtn from "./googleSignOutBtn";
import { type Session } from 'next-auth'
import { useSession } from "next-auth/react";
import Image from "next/image";


interface SignInBtnProps {
    session: Session | null
}


export default function SignInBtn({ session }: SignInBtnProps) {

    console.log(session?.user.image)

    return (
        <>
            {
                !session?.user ?
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant={'ghost'} className="rounded-xl gap-2">
                                <FaUserCircle color="gray" size={30}></FaUserCircle>
                                <span className="text-base text-muted-foreground">Sign in</span>

                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuGroup>
                                <DropdownMenuItem>
                                    <GoogleSignInBtn></GoogleSignInBtn>

                                </DropdownMenuItem>
                            </DropdownMenuGroup>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    :

                    (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                
                                <Button variant='ghost' className="h-9 w-9 rounded-full py-0 px-0 md:rounded-sm md:px-4 md:py-2 md:w-auto">
                                    {
                                        session.user.image ? 
                                        <Image src={session.user.image} width={30} height={30} alt="User Avatar" className="rounded-full md:hidden" unoptimized>

                                        </Image>
                                         : 
                                        (
                                            
                                            <FaUserCircle size={30}></FaUserCircle>
                                        
                                        )
                                    }
                                    
                                    <span className="hidden md:inline font-semibold">
                                        {session.user.name}
                                    </span>
                                </Button>


                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuLabel className="text-muted-foreground">
                                    {`${session.user.email}`}
                                </DropdownMenuLabel>
                                <DropdownMenuSeparator></DropdownMenuSeparator>
                                <DropdownMenuGroup>
                                    <DropdownMenuItem>
                                        <GoogleSignOutBtn></GoogleSignOutBtn>

                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>

                    )

            }
        </>
    )


    /*  const cacheBustedUrl = `${session.user.image}?v=${new Date().getTime()}`
     const testBlankurl = undefined */


}