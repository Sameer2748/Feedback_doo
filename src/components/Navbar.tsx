"use client";
import React from 'react'
import Link from "next/link";
import {useSession, signOut} from "next-auth/react"
import { User } from 'next-auth';

const Navbar = () => {
    const{data:session} = useSession()
    // we have to do assertion
    
    const user: User = session?.user as User



  return (
    <nav className='p-4 md:p-6 shadow-md'> 
        <div className='container mx-auot flex flex-col md:flex-row justify-between items-center'>
            <a className='text-xl font-bold mb-4 md:mb-0' href="">Feddback Doo</a>
            {
                session ? (
                    <>
                    <span className='mr-4'>Welcome, {user?.username || user?.email} </span>
                    <button className='md:w-auto w-full' onClick={()=> signOut()}>Logout</button>
                    </>
                ): (
                    <Link href="/signIn">
                        <button className='md:w-auto w-full'>login</button>
                    </Link>
                )
            }
        </div>

    </nav>
  )
}

export default Navbar