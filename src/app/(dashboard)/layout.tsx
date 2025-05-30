import React from 'react'
import Navbar from '../_components/layout/Navbar'
import Footer from '../_components/layout/Footer'
import { api } from '~/trpc/server'

const Layout = async ({children}: {children:React.ReactNode}) => {
  
  let categoryData = await api.public.tag.getCategory();
  
  let tagData =  await api.public.tag.listTag();

  categoryData = categoryData.filter(Boolean);
  tagData = tagData.filter(Boolean);
  
  
  return (
    <div className='bg-background'>
      <Navbar category={categoryData} tag={tagData} /> 
        <div className='container mx-auto py-10 min-h-screen'>
        {children}
        </div>
        <Footer/>
    </div>
  )
}

export default Layout