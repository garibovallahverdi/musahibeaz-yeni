// layout.tsx (Server Component)

import React from 'react'
import Navbar from '../_components/layout/Navbar'
import Footer from '../_components/layout/Footer'
import { api } from '~/trpc/server'
import { CategoryProvider } from '../providers/CategoryProvider'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  let categoryData = await api.public.tag.getCategory();
  // let tagData = await api.public.tag.listTag();

  // categoryData = categoryData.filter(Boolean);

  return (
    <div className='bg-background'>
      <CategoryProvider>
        <Navbar category={categoryData}  />
        <div className='container mx-auto py-10 min-h-screen'>
          {children}
        </div>
        <Footer />
      </CategoryProvider>
    </div>
  );
};

export default Layout;
