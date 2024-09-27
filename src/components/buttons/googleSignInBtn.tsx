'use client'
import { Button } from "../ui/button";
import { signIn } from 'next-auth/react'


export default function GoogleSignInBtn () {

    return (
        <Button onClick={() => signIn('google')}>Sign in</Button>
    )
}