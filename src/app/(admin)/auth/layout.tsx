import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import React from 'react'
import { getServerSideAuth } from '~/server/auth';

const layout = async({children}: {children:React.ReactNode}) => {
     const session = await getServerSideAuth(await headers());
    
       if (session) {
          return redirect('/admin')
        }
  return (
<div>{children}</div>
  )
}

export default layout