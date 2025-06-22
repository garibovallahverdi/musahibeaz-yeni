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