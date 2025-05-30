"use client"
import React from 'react'
import dynamic from 'next/dynamic'
const DynamicEditor = dynamic(
  () => import('../../_components/Editor'),
  { ssr: false }
)
const Page =  () => {
  return (
    <div className='w-full min-h-screen bg-background'>
      <DynamicEditor/>
    </div>
  )
}

export default Page