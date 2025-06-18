import React from "react";
import { api } from "~/trpc/server";
import NewsContainerByCategory from "../_components/NewContainerByCategory";
import NotFound from "../not-found";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

 interface NewsData {
    articles: {
      description: string;
      category: string;
      id: string;
      slug: string;
      title: string;
      imageUrl: string[];
      publishedAt: Date | null;
      categorie: { name: string; urlName: string; } | null;
    }[];
    count: number;
    nextCursor: string | null | undefined;
  }

const Page = async ({ params, searchParams }: PageProps) => {
  const slug = (await params).slug
  // const cursor = (await searchParams)?.cursor ?? undefined;
  const limit = 4;
  const cursor = undefined
  // const { categories } = useCategories();
  let data: NewsData = { articles: [], count: 0, nextCursor: null };

  // İlk yüklemede server-side veri getir
if (slug.length == 1) {
    const category = decodeURIComponent(slug[0]!)
    
    data = await api.public.article.getNewsByMainCategory({ limit, category, cursor });
  }

  if (slug.length == 2) {
    const category = decodeURIComponent(slug[1]!)
    data = await api.public.article.getNewsBySubCategory({ limit, category, cursor });
  }
   
   let categoryData = null

  if(slug.length < 3 && slug.length >0){
    const urlName = decodeURIComponent(slug[0]!)
    categoryData = await api.public.tag.getCategoryWithChild({urlName})
  }
        console.log(categoryData, 'categoryData');
        
 if (data.count===0 || data instanceof Error) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-10">
     <NewsContainerByCategory activeCategory={slug[1]} categoryData={categoryData} initialData={{
        ...data,
        articles: data.articles.map((article) => ({
          ...article,
          categorie: article.categorie
            ? {
                name: article.categorie.name,
                urlName: article.categorie.urlName,
              }
            : { name: '', urlName: '' }, // fallback if null
        })),
        nextCursor: data.nextCursor ?? undefined,
      }}  limit={limit} />
    </div>
  );
};

export default Page;