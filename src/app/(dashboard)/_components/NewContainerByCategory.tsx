"use client";

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  MutableRefObject,
} from "react";
import { api } from "~/trpc/react";
import NewsCard from "~/app/_components/common/NewsCard";
import SkeletonLoader from "~/app/_components/general/SkeletonLoader";
import Link from "next/link";


type Article = {
  id: string;
  category: string;
  slug: string;
  title: string;
  description: string;
  categorie: {
    name: string;
    urlName: string;

  };
  imageUrl: string[] | null;
  publishedAt: Date | null;
};



type Category = {
  name: string; 
  urlName: string;
  children: {
    name:string,
    urlName:string
  }[];
} | null

type NewsContainerProps = {
  initialData: { articles: Article[]; count: number; nextCursor?: string };
  limit: number;
  categoryData: Category; // optional, if you want to pass category data
  activeCategory?:string
};

const NewsContainerByCategory = ({
  initialData,
  activeCategory,
  categoryData,
  limit,
}: NewsContainerProps) => {
  /* ----------------- state ----------------- */
  const [articles, setArticles] = useState<Article[]>(initialData.articles);
  const [nextCursor, setNextCursor] = useState<string | undefined>(
    initialData.nextCursor
  );
  const [isFetching, setIsFetching] = useState(false);


 console.log(categoryData, "categoryData aaaaaaaa");
 

  /* ----------------- tRPC ctx --------------- */
  const trpcClient = api.useContext();



  /* ----------------- fetch more ------------- */
  const fetchMoreData = useCallback(async () => {
    if (!nextCursor || isFetching) return;

    setIsFetching(true);
    try {
      let res;
      if(activeCategory){

         res = await trpcClient.public.article.getNewsBySubCategory.fetch({
          category:activeCategory,
          limit,
          cursor: nextCursor,
        });
      }else {
           res = await trpcClient.public.article.getNewsByMainCategory.fetch({
          category:categoryData!.urlName,
          limit,
          cursor: nextCursor,
        });
      }

      setArticles((prev) => [...prev, ...(res.articles as Article[])]);
      setNextCursor(res.nextCursor ?? undefined);
    } catch (e) {
      console.error("Infinite-scroll fetch error:", e);
    }
    setIsFetching(false);
  }, [nextCursor, isFetching, limit, trpcClient]);

  /* ----------------- observer --------------- */
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) void fetchMoreData();
      },
      {
        root: null,         // viewport
        rootMargin: "100px",
        threshold: 0.1,    // %100 görünürlük yeterli
      }
    );
  
    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchMoreData, nextCursor]); // kategori değişirse yeni observer kur


  return (
    <div className="flex flex-col gap-6">
      <p className="pl-2 text-2xl text-titleText uppercase">{categoryData?.name}</p>
      <div className="flex gap-3 overflow-x-auto scrollbar-hide text-nowrap">
    {
          (categoryData?.children && categoryData.children.length > 0) && (
            categoryData.children.map((child) => (
                <Link
                key={child.urlName}
                href={`/${categoryData.urlName}/${child.urlName}`}
                className={`pl-2 text-sm text-tagText px-2 py-1  w-max 
                  ${activeCategory == child.urlName?"border-b-4 border-b-blue-500":""}`}
                >
                {child.name}
                </Link>
            ))
          ) }
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {articles.map((a) => (
          <NewsCard key={a.id} article={a} />
        ))}
      </div>

      {isFetching && (
        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
          <SkeletonLoader />
        </div>
      )}

      {/* sentinel */}
{articles.length > 0 && (
  <div ref={sentinelRef} className="h-10 w-full" />
)}
    </div>
  );
};

export default NewsContainerByCategory;
