"use client";
import { useEffect, useState } from "react";
import { api } from "~/trpc/react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
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
const Steps = ({ initialData }: { initialData: { articles: Article[], totalPages: number } }) => {
  const [articles, setArticles] = useState<Article[]>(initialData.articles);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData.totalPages);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(initialData.articles[0] ?? null);

  const { data, isFetching, refetch } = api.public.article.getStepNews.useQuery(
    { limit: 5, page },
    { enabled: false , }, // Use initial data from props
    
  );

  useEffect(() => {
    void refetch();
  }, [page, refetch]);

  useEffect(() => {
    if (data) {
      setArticles(
        data.articles.map((article) => ({
          ...article,
          categorie: {
            name: article.category, // or provide a fallback if needed
            urlName: article.category, // or provide a fallback if needed
          },
        }))
      );
      setTotalPages(data.totalPages);
    }
  }, [data]);

  return (
    <div className="container mx-auto grid grid-cols-1 p-0 my-4  ">
      <div className="grid md:grid-cols-5    gap-6 md:gap-2 items-start">
        
        {/* Ana Haber Alanı */}
        <div className="relative w-full col-span-5 md:col-span-3 h-[300px] sm:h-[400px]  rounded-lg overflow-hidden shadow-2xl">
          <AnimatePresence mode="wait">
            { selectedArticle && (
              <motion.div
                key={selectedArticle.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="relative w-full h-full"
              >
                <Image
                  src={selectedArticle.imageUrl?.[0] ?? "/fallback-image.webp"}
                  alt={selectedArticle.title ?? ""}
                  layout="fill"
                  objectFit="cover"
                  className="rounded-lg"
                  priority
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/70 to-transparent text-white p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold line-clamp-2">{selectedArticle.title}</h2>
                  <p className="text-xs sm:text-sm line-clamp-3 mt-2">{selectedArticle.description}</p>
                  <Link
                    href={`/news/${selectedArticle.categorie.urlName}/${selectedArticle.slug}`}
                    className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition duration-300 text-sm sm:text-base"
                  >
                    Dəvamını Oxu
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Haber Listesi */}
        <div className="col-span-5 md:col-span-2 p-">
          <ul className="space-y-2 sm:space-y-3">
            {isFetching
              ? Array.from({ length: 5 }).map((_, index) => (
                  <li
                    key={index}
                    className="h-16 bg-gray-200 animate-pulse rounded-lg"
                  />
                ))
              : articles.map((article) => (
                  <motion.li
                    key={article.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedArticle(article)}
                    className={`p-3 sm:p-4 font-light border-b border-border text-contentText text-sm sm:text-xs transition rounded-lg cursor-pointer hover:bg-card_bg 
                  ${selectedArticle?.id === article.id ? "bg-card_bg" : ""}
                  h-16 flex items-center`}
                  >
                    {article.title}
                  </motion.li>
                ))}
          </ul>

          {/* Sayfalama Butonları */}
          <div className="mt-6 flex justify-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setPage(pageNum)}
                disabled={isFetching}
                className={`px-4 py-2 rounded-lg transition duration-300 text-sm ${
                  page === pageNum ? "bg-blue-600 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {pageNum}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Steps;
