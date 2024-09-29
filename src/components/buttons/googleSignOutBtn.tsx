'use client'
import { Button } from "../ui/button";
import { signOut } from 'next-auth/react'
import { MdLogout } from "react-icons/md";

export default function GoogleSignOutBtn () {

    return (
        <Button className="flex gap-2 border-none shadow-none" variant={'outline'} onClick={() => signOut()}>
            <MdLogout></MdLogout>
            <span>Logout</span>
        </Button>
    )
}