import React from "react";
import { api } from "~/trpc/server";
import NewsContainerByTag from "../../_components/NewContainerByTag";
import NotFound from "../../not-found";

type PageProps = {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
  const tag = decodeURIComponent((await params)?.tag);
  const cursor = (await searchParams)?.cursor ?? undefined;
  const limit = 4 ;

  // İlk yüklemede server-side veri getir
  const data = await api.public.tag.getArticleBytag({ limit, tag, cursor });
  const tagData = await api.public.tag.getTagByByValue({ tagValue: tag });
  console.log(data, "dataaaaaaa");
  
  if (data.count===0 || data instanceof Error || !tagData) {
    return <NotFound />
  }

  return (
   <div className="flex flex-col gap-10">
      <NewsContainerByTag tagData={tagData}  initialData={{
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
      }} tag={tag} limit={limit} />
    </div>
  );
};

export default Page;