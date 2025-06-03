'use client'
import React, { useState } from 'react'
import { api } from '~/trpc/react';
import Loading from '../_components/loading';
import { CiBookmarkRemove } from "react-icons/ci";
import { toast } from 'sonner';


const TagPage =  () => {
  const [newCategory, setNewCategory] = useState("");

     const { data, isLoading, isError , refetch} = api.admin.article.getAllCategory.useQuery(undefined, {
            staleTime: Infinity,          // “sonsuz” taze – yeniden isteme
            refetchOnMount: false,        // her yeni mount’ta tekrar etme
            refetchOnWindowFocus: false,  // pencere odağında tekrar etme
            refetchOnReconnect: false
});


     const { mutate: addCategory, isPending: isAdding } = api.admin.article.createCategory.useMutation({
      onSuccess: () => {
        void refetch(); 
        setNewCategory(""); 
      },
      onError: (error) => {

        console.error( error.message);
        toast.error(error.message)
      },
    });

    // const { mutate: removeCategory, isPending: isRemoving } = api.admin.news.removeCategory.useMutation({
    //   onSuccess: () => {
    //     void refetch(); 
    //   },
    //   onError: (error) => {

    //     console.error( error.message);
    //     toast.error(error.message)
    //   },
    // });
  
    // const handleRemoveCategory = (category:string) => {
    //   removeCategory({ category: category });
    // }
    const handleAddCategory = () => {
      if (!newCategory.trim()) return;
      addCategory({ category: newCategory });
    }


     if (isLoading) return <Loading/>;
    //  if (isError) return <p>Veri alınırken hata oluştu.</p>;
  return (
    <div className="grid lg:grid-cols-4 gap-3 items-start mx-auto p-6 bg- shadow-md rounded-md">
       {/* Yeni kategori ekleme */}
    <div className="flex col-span-2 justify-center items-center gap-2">
      <div className='flex flex-col gap-2 w-full  justify-center'>
      <label htmlFor="addCategory" className='text-xl font-semibold'>Kategori əlavə et</label>
      <input
      name='addCategory'
        type="text"
        value={newCategory}
        onChange={(e) => setNewCategory(e.target.value)}
        className="border p-2 rounded-md flex-1"
        placeholder="Yeni kategori gir..."
        />
        </div>
      <button
        onClick={handleAddCategory}
        className="bg-blue-500 h-1/2 self-end text-white px-4 py-2 rounded-md"
        disabled={isAdding}
      >
        {isAdding ? "Ekleniyor..." : "Ekle"}
      </button>
    </div>
  <div className='col-span-2'>
  <h2 className="text-xl font-semibold mb-4">Kategoriyalar</h2>

{/* Mevcut kategoriləri listeleme */}
{isLoading ? (
  <p>Yükleniyor...</p>
) : (
  <div className='flex flex-col gap-3'>
    {/* {
      isRemoving && <p   className='px-5 text-sm text-danger '>Kategori silinir...</p>  
    } */}
    
  <ul className="flex flex-wrap">
    {data?.map((category) => (
      <li key={category.id} className="px-2 py-1 flex gap-2 items-center bg-gray-100 rounded-md  mr-2 mb-2">
       <span className='flex gap-2'>
        #{category.name}
        </span> 
        <div className='group  relative'>

        {/* <CiBookmarkRemove onClick={()=>handleRemoveCategory(category.name)} className='text-lg cursor-pointer text-danger'/> */}
        {/* <span className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-md transition-opacity duration-200">
          Sil
        </span> */}
        </div>

      </li>
    ))}
  </ul>
  </div>

)}
  </div>
   
  </div>
  )
  
}

export default TagPage