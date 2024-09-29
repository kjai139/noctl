
import { AvatarImage } from "@radix-ui/react-avatar";
import { auth, signIn } from "../../../auth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaUserCircle } from "react-icons/fa";
import GoogleSignInBtn from "./googleSignInBtn";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MdOutlineLogout } from "react-icons/md";
import GoogleSignOutBtn from "./googleSignOutBtn";
export default async function SignInBtn () {

    const session = await auth()

    if (!session?.user || !session) {
       return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <FaUserCircle size={30}></FaUserCircle>
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

    return (
        <div>
            <DropdownMenu>
                <DropdownMenuTrigger>
                <Avatar>
                <AvatarImage alt="User avatar" src={session?.user.image || ''}></AvatarImage>
                <AvatarFallback><FaUserCircle></FaUserCircle></AvatarFallback>
                </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuLabel>
                        My Account
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