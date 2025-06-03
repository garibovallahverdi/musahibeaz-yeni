// "use client";
// import React, { useEffect, useState, useRef, useCallback } from "react";
// import NewsCard from "~/app/_components/common/NewsCard";
// import { api } from "~/trpc/react";
// import SkeletonLoader from "~/app/_components/general/SkeletonLoader";

// type Article = {
//   category: string;
//     slug: string;
//     title: string;
//     description: string;
//     imageUrl: string[] | null;
//     publishedAt: Date | null;
//     id: string;
//   }
// type NewsContainerProps = {
//   initialData: { articles: Article[];  nextCursor?: string | null | undefined ,searchTerm: string | undefined , cached: boolean};
//   search: string;
//   limit: number;
// };

// const NewsContainerByCategory = ({ initialData, search, limit }: NewsContainerProps) => {
//   const [articles, setArticles] = useState<Article[]>(initialData.articles);
//   const [nextCursor, setNextCursor] = useState<string | undefined>(initialData.nextCursor ?? undefined);
//   const [isFetching, setIsFetching] = useState(false);
//   const observerRef = useRef<HTMLDivElement | null>(null);

//   console.log("Başlangıç nextCursor:", nextCursor);

//   // useQuery kullanımı: Hook sadece bileşen içinde çağrılmalı!
//   const trpcClient = api.useContext();
  
//   // Veriyi çekme fonksiyonu
//   const fetchMoreData = useCallback(async () => {
//     console.log(nextCursor, "nextCursor");
    
//     if (!nextCursor  || isFetching) return;

//     console.log("Yeni veri çekiliyor...");
//     setIsFetching(true);

//     try {
//       const response = await trpcClient.public.article.search.fetch({
//         search,
//         limit,
//         cursor: nextCursor,
//       });

//       console.log("API Yanıtı:", response);

//       if (response?.articles.length > 0) {
//         setArticles((prev) => [...prev, ...(response.articles as Article[])]);
//         setNextCursor(response?.nextCursor ?? undefined);
//       } else {
//         console.log("Daha fazla veri yok.");
//         setNextCursor(undefined);
//       }
//     } catch (error) {
//       console.error("Veri yüklenirken hata oluştu:", error);
//     }
//     setIsFetching(false);
//   }, [nextCursor, isFetching, search, limit, trpcClient]);

//   // Intersection Observer ayarı
//   useEffect(() => {
//     if (!observerRef.current) return;

//     const observer = new IntersectionObserver(
//       (entries) => {
//         if (entries[0]?.isIntersecting && nextCursor) {
//           void fetchMoreData();
//         }
//       },
//       { rootMargin: "100px", threshold: 1.0 }
//     );

//     observer.observe(observerRef.current);
//     return () => observer.disconnect();
//   }, [fetchMoreData, nextCursor]);

//   console.log(articles.length, "Makale sayısı");
  
//   return (
//     <div className="flex flex-col gap-6">
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {articles.map((article) => (
//           <NewsCard article={article} key={article.id} />
//         ))}
       
//       </div>

//       {isFetching && (
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4  mt-6">
//           <SkeletonLoader />
//           <SkeletonLoader />
//           <SkeletonLoader />
//         </div>
//       )}
//       {/* Yükleniyor göstergesi */}
     

//       {/* Observer'ın hedef noktası */}
//       <div ref={observerRef} className="h-5" />
//     </div>
//   );
// };

// export default NewsContainerByCategory;
