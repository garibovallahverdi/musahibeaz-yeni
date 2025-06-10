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

  return (
    <div className='w-full min-h-screen bg-background'>
      <DynamicEditor />
    </div>
  )
}

export default Update