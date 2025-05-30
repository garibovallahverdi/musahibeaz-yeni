"use client"
import { type Article,  ArticleStatus } from "@prisma/client";
import { useParams } from "next/navigation";
import { api } from "~/trpc/react";
import Loading from "../../_components/loading";
import { formatLocalizedDate } from "~/utils/dateFormater";
import { useUser } from "~/app/hooks/useUser";
import Link from "next/link";

const NewsDetail =   () => {

  const params = useParams(); 
  const slug = params.slug as string;
      const user =  useUser()
    

  const { data, isLoading, isError, refetch } = api.admin.news.getById.useQuery({slug:slug},    
    {
      // Only fetch if slug is available
      enabled: !!slug,
      // Data will be considered fresh indefinitely.
      // It will only re-fetch if `refetch()` is called manually.
      staleTime: Infinity,
      // Prevent automatic re-fetching on window focus
      refetchOnWindowFocus: false,
      // Prevent automatic re-fetching on component mount (after initial fetch)
      refetchOnMount: false,
      // Prevent automatic re-fetching on network reconnect
      refetchOnReconnect: false,
    }
);

   const { mutate: publishArticle,  isPending } = api.admin.news.publish.useMutation({
    onSuccess: () => {
    void  refetch(); 
    },
    onError: (error) => {
      console.error("Yayınlama sırasında hata oluştu:", error.message);
    },
  });

  const { mutate: archiveArticle,  isPending: archivingPending } = api.admin.news.archived.useMutation({
    onSuccess: () => {
      void refetch(); 
    },
    onError: (error) => {
      console.error("Arsivleme sırasında hata oluştu:", error.message);
    },
  });



  const handlePublish = () => {
    if (!data?.id) return;
    publishArticle({ id: data.id , slug: data.slug });  
  };

  const handleArchive = () => {
    if (!data?.id) return;
    archiveArticle({ id: data.id , slug: data.slug });
  };
  
   if (isLoading) return <Loading/>
   if (isError) return <p>Veri alınırken hata oluştu.</p>;
   

  return (
    < div className="w-full grid grid-cols-1 lg:grid-cols-5">
      <div className="col-span-1  lg:col-span-3">

      <h2 className="text-titleText ql-size-huge pb-10 "> {data?.title} </h2>

          
        <div className="news-detail-content " dangerouslySetInnerHTML={{ __html: data?.content ?? "" }} />

        <div className="mt-4 flex gap-2 flex-wrap">
          {
            data?.tags?.map(tag=>(
              <span key={tag.name} className="px-2 block py-1 border-2 border-border">#{tag.name}</span>
            ))
          }
          
        </div>
      </div>
      <div className="lg:col-span-2 col-span-1 flex items-start gap-3 flex-col  pl-4  pr-4 pt-4">
        {
          user.session && user.session.user.role == 'admin' &&
        
        <div className="flex gap-4 ">

      <button
          onClick={handleArchive}
          className="bg-gray-500 disabled:bg-gray-200 text-white px-2  rounded-md py-1"
          disabled={archivingPending || data?.status == ArticleStatus.ARCHIVED}
        >
          {data?.status == ArticleStatus.ARCHIVED?"ARCHIVED":archivingPending ? "Archiving..." : "ARCHIVE"}
        </button>
      <button
          onClick={handlePublish}
          className="bg-green-500 disabled:bg-green-200 text-white px-2  rounded-md py-1"
          disabled={isPending || data?.status == ArticleStatus.PUBLISHED}
        >
          {data?.status == ArticleStatus.PUBLISHED?"PUBLISHED":isPending ? "Publishing..." : "PUBLISH"}
        </button>   
        </div>
}
          {
          user.session && user.session.user.role == 'editor' && 
          <div className="flex gap-4 ">
            <Link  href={`/admin/news/edit/${data?.slug}`} className="bg-gray-500 disabled:bg-gray-200 text-white px-2  rounded-md py-1">
                Update
             </Link>
        </div>
          }
        <div>
          <p> <span className="font-semibold">Yaradilma tarixi :</span>  { formatLocalizedDate(data?.createdAt )}</p>
           {
             data?.status != ArticleStatus.DRAFT &&
          <p> {data?.status == ArticleStatus.PUBLISHED? 'Yayınlanma tarixi :':"Arşivlənmə tarixi :"} {formatLocalizedDate(data?.publishedAt ?? undefined )}</p>
         
           }

{
  user.session && user.session.user.role == 'admin'  &&
           <div className="mt-4 flex flex-col gap-2">

          <p> <span className="font-semibold">Kategory :</span> {data?.category}</p>
          <p> <span className="font-semibold">Yazar :</span> {data?.author.name}</p>
          <p> <span className="font-semibold">Status :</span> {data?.status}</p>
          <p> <span className="font-semibold">ID :</span> {data?.id}</p>
           </div>
}

        </div>
         </div> 
      
        
    </div>
   

  
  );
};

export default NewsDetail;
