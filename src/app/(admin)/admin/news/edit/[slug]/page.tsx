"use client"
import React from 'react'
import dynamic from 'next/dynamic'
import { useParams } from 'next/navigation'
import { api } from '~/trpc/react'
import { logger } from 'better-auth'
const DynamicEditor = dynamic(
  () => import('../../../_components/Editor'),
  { ssr: false }
)
const Update =() => { 
    const params = useParams(); // params burada alınır
    const slug = params.slug as string;
    // const { data, isLoading, isError } = api.admin.news.getById.useQuery({ slug: slug });

  return (
    <div className='w-full min-h-screen bg-background'>
      <DynamicEditor/>
    </div>
  )
}

export default Update