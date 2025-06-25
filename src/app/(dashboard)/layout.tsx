// layout.tsx (Server Component)

import React from 'react'
import Navbar from '../_components/layout/Navbar'
import Footer from '../_components/layout/Footer'
import { api } from '~/trpc/server'
type Category = {
  name: string;
  urlName: string;
  children: Category[]; // Recursive type for nested children
};
const Layout = async ({ children }: { children: React.ReactNode }) => {
  const categoryData = await api.public.tag.getCategory() as Category[];
  // let tagData = await api.public.tag.listTag();

  // Define a type for the category data

  // Ensure each category has a children property
  // const normalizedCategoryData: Category[] = categoryData.map((cat: { id: string; name: string; children?: any }): Category => ({
  //   name: cat.name,
  //   urlName:cat.urlName,
  //   children: (cat.children as Category[] | undefined) ?? [],
  // }));

  return (
    <div className='bg-background'>
        <Navbar category={categoryData}  />
        <div className='container mx-auto py-10 min-h-screen'>
          {children}
        </div>
        <Footer />
    </div>
  );
};

export default Layout;
