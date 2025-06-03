import React from "react";
import { api } from "~/trpc/server";
import NewsContainerByCategory from "../../_components/NewContainerByCategory";
import NotFound from "../../not-found";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
  const category = decodeURIComponent((await params)?.category);
  const cursor = (await searchParams)?.cursor ?? undefined;
  const limit = 4;
  // const { categories } = useCategories();

  // İlk yüklemede server-side veri getir
  const data = await api.public.article.getNewsByCategory({ limit, category, cursor });
   const categoryData = await api.public.tag.getCategoryWithTags({
          urlName: category,
        });

        
 if (data.count===0 || data instanceof Error || !categoryData) {
    return <NotFound />
  }

  return (
    <div className="flex flex-col gap-10">
      <NewsContainerByCategory categoryData={categoryData} initialData={{
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
      }} category={category} limit={limit} />
    </div>
  );
};

export default Page;