import React from "react";
import { api } from "~/trpc/server";
import NewContainerBySearch from "../../_components/NewContainerBySearch";

type PageProps = {
  params: Promise<{ search: string }>;
};

const Page = async ({ params }: PageProps) => {
  const search = decodeURIComponent((await params).search);
  const limit = 3;
  const initialData = await api.public.article.search({
    limit,
    cursor: null,
    search,
  }); 

  

 if(initialData.articles.length === 0) {
    return (
      <div className="flex flex-col gap-10">
        <p className="text-2xl text-titleText pl-2">
          "{search}" ilə bağlı heç bir nəticə tapılmadı
        </p>
      </div>
    );
 }
  

  return (
    <div className="flex flex-col gap-10">
      <p className="text-2xl text-titleText pl-2">
        "{search}" ilə bağlı axtarış nəticələri
      </p>
      <NewContainerBySearch
        initialData={initialData}
        search={search}
        limit={limit}
      />
    </div>
  );
};

export default Page;
