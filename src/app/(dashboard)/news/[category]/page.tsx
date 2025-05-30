import React from "react";
import { api } from "~/trpc/server";
import NewsContainerByCategory from "../../_components/NewContainerByCategory";

type PageProps = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
  const category = decodeURIComponent((await params)?.category);
  const cursor = (await searchParams)?.cursor ?? undefined;
  const limit = 3;

  // İlk yüklemede server-side veri getir
  const data = await api.public.article.getNewsByCategory({ limit, category, cursor });

  if (!data) {
    return <p>Data yoxdur</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-2xl text-titleText pl-2">{category} xəbərləri</p>
      <NewsContainerByCategory initialData={{...data, nextCursor: data.nextCursor ?? undefined}} category={category} limit={limit} />
    </div>
  );
};

export default Page;