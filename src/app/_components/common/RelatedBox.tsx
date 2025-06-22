"use client"

import React from 'react'
import RelatedNewsCard from './RelatedNewsCard'
import { api } from '~/trpc/react';
import { Article } from '@prisma/client';

interface Tag {
  name: string;
}

const RelatedBox = ({ tags ,currentSlug, category,parentCategory}: { tags: Tag[],currentSlug:string, category:string,parentCategory:string | undefined }) => {
  
  const {data, isPending} =  api.public.article.getRelatedNews.useQuery({ tags: tags ?? [],currentSlug, category:parentCategory! });
  
  console.log(data, "dataaaaaaaaa");
  return (
       <div className="lg:col-span-1 space-y-6">
          <h3 className="text-2xl font-semibold text-titleText">{category}</h3>
          <div className="gap-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
            {
            data?.map((related ) => (
              <RelatedNewsCard key={related.id} data={related} />
            ))
            }
          </div>
        </div>
  )
}

export default RelatedBox