// layout.tsx (Server Component)

import React from 'react'
import Navbar from '../_components/layout/Navbar'
import Footer from '../_components/layout/Footer'
import { api } from '~/trpc/server'

const Layout = async ({ children }: { children: React.ReactNode }) => {
  let categoryData = await api.public.tag.getCategory();
  // let tagData = await api.public.tag.listTag();

  // Ensure each category has a children property
  const normalizedCategoryData = categoryData.map((cat: any) => ({
    ...cat,
    children: cat.children ?? [],
  }));

  return (
    <div className='bg-background'>
        <Navbar category={normalizedCategoryData}  />
        <div className='container mx-auto py-10 min-h-screen'>
          {children}
        </div>
        <Footer />
    </div>
  );
};

export default Layout;
