
import { AvatarImage } from "@radix-ui/react-avatar";
import { auth, signIn } from "../../../auth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaUserCircle } from "react-icons/fa";
import GoogleSignInBtn from "./googleSignInBtn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import GoogleSignOutBtn from "./googleSignOutBtn";
import { type Session } from 'next-auth'

interface SignInBtnProps {
    session: Session | null
}


export default async function SignInBtn ({session}:SignInBtnProps) {

    
    console.log('session', session)
    

    if (!session?.user || !session) {
       return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <div className="cursor-pointer" aria-label="Open Sign in menu">
                    <FaUserCircle size={40}></FaUserCircle>
                    </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <GoogleSignInBtn></GoogleSignInBtn>

                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            
       ) 
    }
    /* const cacheBustedUrl = `${session.user.image}?v=${new Date().getTime()}` */

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    {
                        session.user.image ? 
                        <Avatar>
                        <AvatarImage alt="User avatar" src={session.user.image!}></AvatarImage>
                        
                        <AvatarFallback>
                        <FaUserCircle size={40}></FaUserCircle>
                        </AvatarFallback>
                        </Avatar>
                        : 
                        <AvatarFallback>
                        <FaUserCircle size={40}></FaUserCircle>
                        </AvatarFallback>
                    }

                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        {`Logged in as ${session.user.email}`}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator></DropdownMenuSeparator>
                    <DropdownMenuGroup>
                        <DropdownMenuItem>
                            <GoogleSignOutBtn></GoogleSignOutBtn>

                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            

        </div>
    )
}