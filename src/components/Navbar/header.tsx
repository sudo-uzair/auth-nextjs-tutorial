"use client"
import React from 'react'
import { useSession } from "next-auth/react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SignOut } from '../sign-out';

const Header = () => {
  const { data: session } = useSession();
  const username = session?.user?.username;

  return (
    <div>
      <div className="flex items-center justify-between px-6 py-4 bg-white">
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600 hidden sm:block">
            {username ? `Welcome, ${username}` : "Welcome"}
          </span>
          <Avatar>
            <AvatarFallback>
              {username ? username[0].toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <SignOut />
        </div>
      </div>
    </div>
  )
}

export default Header