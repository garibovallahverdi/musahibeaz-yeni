'use client'
import React, { useState } from 'react'
import { api } from '~/trpc/react';
import Loading from '../_components/loading';
import { CiBookmarkRemove } from "react-icons/ci";
import { toast } from 'sonner';


const TagPage =  () => {
  const [newTag, setNewTag] = useState("");

     const { data, isLoading, isError , refetch} = api.admin.tag.list.useQuery({});


     const { mutate: addTag, isPending: isAdding } = api.admin.tag.create.useMutation({
      onSuccess: () => {
        void refetch(); 
        setNewTag(""); 
      },
      onError: (error) => {

        console.error( error.message);
        toast.error(error.message)
      },
    });

    const { mutate: removeTag, isPending: isRemoving } = api.admin.tag.remove.useMutation({
      onSuccess: () => {
        void refetch(); 
      },
      onError: (error) => {

        console.error( error.message);
        toast.error(error.message)
      },
    });
  
    const handleRemoveTag = (tag:string) => {
      removeTag({ tag: tag });
    }
    const handleAddTag = () => {
      if (!newTag.trim()) return;
      addTag({ tag: newTag });
    }


     if (isLoading) return <Loading/>;
     if (isError) return <p>Veri alınırken hata oluştu.</p>;
  return (
    <div className="grid lg:grid-cols-4 gap-3 items-start mx-auto p-6 bg- shadow-md rounded-md">
       {/* Yeni etiket ekleme */}
    <div className="flex col-span-2 justify-center items-center gap-2">
      <div className='flex flex-col gap-2 w-full  justify-center'>
      <label htmlFor="addTag" className='text-xl font-semibold'>Tag əlavə et</label>
      <input
      name='addTag'
        type="text"
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        className="border p-2 rounded-md flex-1"
        placeholder="Yeni etiket gir..."
        />
        </div>
      <button
        onClick={handleAddTag}
        className="bg-blue-500 h-1/2 self-end text-white px-4 py-2 rounded-md"
        disabled={isAdding}
      >
        {isAdding ? "Ekleniyor..." : "Ekle"}
      </button>
    </div>
  <div className='col-span-2'>
  <h2 className="text-xl font-semibold mb-4">Etiketler</h2>

{/* Mevcut etiketleri listeleme */}
{isLoading ? (
  <p>Yükleniyor...</p>
) : (
  <div className='flex flex-col gap-3'>
    {
      isRemoving && <p   className='px-5 text-sm text-danger '>Tag silinir...</p>  
    }
    
  <ul className="flex flex-wrap">
    {data?.map((tag) => (
      <li key={tag.id} className="px-2 py-1 flex gap-2 items-center bg-gray-100 rounded-md  mr-2 mb-2">
       <span className='flex gap-2'>
        #{tag.name}
        </span> 
        <div className='group  relative'>

        <CiBookmarkRemove onClick={()=>handleRemoveTag(tag.name)} className='text-lg cursor-pointer text-danger'/>
        <span className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-md transition-opacity duration-200">
          Sil
        </span>
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