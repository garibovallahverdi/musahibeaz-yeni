"use client";
import { ArticleStatus } from "@prisma/client";
import React, { useEffect, useState } from "react";
import Pagination from "~/app/_components/common/Pagination";
import { api } from "~/trpc/react";
import Loading from "../_components/loading";
import Link from "next/link";
import Image from "next/image";
import { formatLocalizedDate } from '~/utils/dateFormater'
import { useUser } from "~/app/hooks/useUser";
import { logger } from "better-auth";

const Page = () => {
  const [page, setPage] = useState(1);
  const [author, setAuthors] = useState();
  const limit = 3; // Sayfa başına kaç kayıt geleceğini belirle
  const [status,setStatus] = useState<ArticleStatus>(ArticleStatus.DRAFT)
  const user =  useUser()


  useEffect(() => {
    if (user.session && user.session.user.role === "editor") {
      setAuthors(user.session.user.id as string);
    } else {
      setAuthors(undefined);
    }
  }, [user])

  // API'den verileri çek
  const { data, isLoading, isError , error } = api.admin.news.newsListAdmin.useQuery({
    status: status,
    limit,
    authorId: author,
    page,
  });

  // Yükleniyor ekranı
  if (isLoading) return <Loading/>;
  if (isError) return <p>Veri alınırken hata oluştu. {error.message}</p>;

  return (
    <div className="p-4 flex flex-col gap-3 ">
      <h1 className="text-lg font-bold">Admin Haberler</h1>
      <div className="w-full  flex gap-2 my-5">
        <span onClick={(e)=>{setStatus(ArticleStatus.DRAFT); setPage(1);}} className={`${status==ArticleStatus.DRAFT&&'bg-gray-500 text-white'} cursor-pointer bg-background border-2 px-2 py-1`}>{ArticleStatus.DRAFT}</span>
        <span onClick={(e)=>{setStatus(ArticleStatus.PUBLISHED); setPage(1);}} className={`${status==ArticleStatus.PUBLISHED&&'bg-gray-500 text-white'} cursor-pointer bg-background border-2 px-2 py-1`}>{ArticleStatus.PUBLISHED}</span>
        <span onClick={(e)=>{setStatus(ArticleStatus.ARCHIVED); setPage(1)}} className={`${status==ArticleStatus.ARCHIVED&&'bg-gray-500 text-white'} cursor-pointer bg-background border-2 px-2 py-1`}>{ArticleStatus.ARCHIVED}</span>
      </div>
      {
        data &&  data?.article?.length <=0?
          <div className="w-full  flex justify-center  items-center ">
              <p className="text-xl  text-danger">Məlumat mövcud deyil.</p>
          </div>
      
      :<div className=" grid grid-cols-1 md:grid-cols-2  lg:grid-cols-3 justify-center  items-center gap-2">

      { data?.article.map((article) => (
  <div
    key={article.id}
    className="max-w-sm flex flex-col mx-auto  bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700"
  >
    <Link href={`news/${article.slug}`} className="block">
      <div className="w-full h-[300px] overflow-hidden">
        <Image
          width={300}
          height={300}
          className="w-full h-full object-cover rounded-t-lg"
          src={article.imageUrl[0] ?? ""}
          alt=""
        />
      </div>
    </Link>
    <div className="p-5">
      <Link href={`news/${article.slug}`}>
        <h5 className="mb-2 text-2xl line-clamp-2 font-bold tracking-tight text-gray-900 dark:text-white">
         {article.title}
        </h5>
      </Link>
      <p className="mb-3 line-clamp-3 font-normal text-gray-700 dark:text-gray-400">
        {article.description}.
      </p>
      <div className="flex gap-3">
      Aktivlik statusu :
      <span
        className={`inline-flex ${article.status == ArticleStatus.DRAFT && "bg-blue-700"} ${article.status == ArticleStatus.PUBLISHED && "bg-green-700"} ${article.status == ArticleStatus.ARCHIVED && "bg-gray-500"}  items-center px-3 py-1 text-sm font-medium text-center text-white  rounded-lg  focus:ring-4 focus:outline-none `}
        >
     {article.status}
      
      </span>
        </div>
    </div>
  </div>
))}

          </div>
}

   {
    data!.count >limit && <Pagination setPage={setPage} limit={limit} count={data!.count} page={page}/>
   }
    </div>
  );
};

export default Page;
