import React from 'react'
import Link from 'next/link'
import { TfiWrite } from 'react-icons/tfi'
import DarkModeButton from '~/app/_components/general/DarkModeButton'
import { FaHashtag } from "react-icons/fa6";
import { auth, getServerSideAuth } from '~/server/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { authClient } from '~/server/auth/client';
import { toast } from 'sonner';
import Sidebar from './_components/Sidebar'

const layout = async ({children}: {children:React.ReactNode}) => {
   const session = await getServerSideAuth(await headers());

   if (!session) {
      return redirect('/auth/login')
    }

 
    
  return (
   <div className=''>
<button data-drawer-target="default-sidebar" data-drawer-toggle="default-sidebar" aria-controls="default-sidebar" type="button" className="inline-flex items-center p-2 mt-2 ms-3 text-sm text-gray-500 rounded-lg sm:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600">
   <span className="sr-only">Open sidebar</span>
   <svg className="w-6 h-6" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
   <path clipRule="evenodd" fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h7.5a.75.75 0 010 1.5h-7.5a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z"></path>
   </svg>
</button>

{
   (session.user.role =='editor' || session.user.role =='admin') && <Sidebar session={session}/>
}

<div className="p-4 sm:ml-64  min-h-screen bg-background text-contentText">
   
   {children}

   <div className='fixed right-10 bottom-10'>
<DarkModeButton/>

   </div>
</div>
</div>

  )
}

export default layout