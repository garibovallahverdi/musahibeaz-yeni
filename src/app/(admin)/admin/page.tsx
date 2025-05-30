import { headers } from 'next/headers';
import React from 'react'
import { getServerSideAuth } from '~/server/auth';

const page = async() => {
     const session = await getServerSideAuth(await headers());
  
     if(session?.user.role == 'user') {
      return(
        <div className='w-full'>
          <p>İstifadəçı admin tərəfindən təsdiq olunmalıdır.</p>
        </div>
      )
     }
  return (
    <div>ADMIN PANEL</div>
  )
}

export default page