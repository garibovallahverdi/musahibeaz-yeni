import React from "react";
import { api } from "~/trpc/server";
import NewsContainerByCategory from "../../_components/NewContainerByCategory";
import NewsContainerByTag from "../../_components/NewContainerByTag";

type PageProps = {
  params: Promise<{ tag: string }>;
  searchParams?: Promise<{ cursor?: string }>;
};

const Page = async ({ params, searchParams }: PageProps) => {
  const tag = decodeURIComponent((await params)?.tag);
  const cursor = (await searchParams)?.cursor ?? undefined;
  const limit = 3;

  // İlk yüklemede server-side veri getir
  const data = await api.public.tag.getArticleBytag({ limit, tag, cursor });
  console.log("Server-side veri:", data);
  if (!data || data instanceof Error) {
    return <p>Data yoxdur</p>;
  }

  return (
    <div className="flex flex-col gap-10">
      <p className="text-2xl text-titleText pl-2">{tag} tağı ilə bağlı xəbərləri</p>
      <NewsContainerByTag initialData={{...data, nextCursor: data.nextCursor ?? undefined}} tag={tag} limit={limit} />
    </div>
  );
};

export default Page;