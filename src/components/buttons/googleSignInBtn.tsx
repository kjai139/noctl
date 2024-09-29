'use client'
import { Button } from "../ui/button";
import { signIn } from 'next-auth/react'
import { FcGoogle } from "react-icons/fc";

export default function GoogleSignInBtn () {

    return (
        <Button className="flex gap-2 shadow-none border-none" variant={'outline'} onClick={() => signIn('google')}>
            <FcGoogle size={20}></FcGoogle>
            <span>Sign in with google</span>
            </Button>
    )
}