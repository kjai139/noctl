
import { AvatarImage } from "@radix-ui/react-avatar";
import { auth, signIn } from "../../../auth";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Button } from "../ui/button";
import { FaUserCircle } from "react-icons/fa";
import GoogleSignInBtn from "./googleSignInBtn";


export default async function SignInBtn () {

    const session = await auth()

    if (!session?.user || !session) {
       return (
            <GoogleSignInBtn></GoogleSignInBtn>
       ) 
    }

    return (
        <div>
            
            <Avatar>
                <AvatarImage alt="User avatar" src={session?.user.image || ''}></AvatarImage>
                <AvatarFallback><FaUserCircle></FaUserCircle></AvatarFallback>
            </Avatar>
        </div>
    )
}