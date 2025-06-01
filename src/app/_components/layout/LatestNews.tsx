"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatLocalizedDate } from "~/utils/dateFormater";
import type { Article } from "@prisma/client";

const LatestNews = ({ initialData }: { initialData: { articles: Article[], totalPages: number } }) => {
  const articles = initialData.articles;

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold text-titleText mb-4 pl-2 sm:pl-4">Son Xəbərlər</h2>
      <div className=" sm:p-4">
        <ul className="flex flex-col gap-3">
          {articles.map((article) => (
            <motion.li
              key={article.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className={`p-3 sm:p-4 font-normal border rounded-lg cursor-pointer transition duration-200 ease-in-out
              bg-card_bg text-contentText border-border flex items-center gap-4`}
              style={{
                backgroundColor: "rgb(var(--card_bg))",
                color: "rgb(var(--contentText))",
                borderColor: "rgb(var(--border))",
              }}
            >
              {/* {article.imageUrl?.[0] && (
                <div className="relative w-20 h-16 sm:w-24 sm:h-20 flex-shrink-0 rounded overflow-hidden">
                  <Image
                    src={article.imageUrl[0]}
                    alt={article.title}
                    layout="fill"
                    objectFit="cover"
                    className="rounded"
                  />
                </div>
              )} */}
              <div className="flex flex-col flex-grow gap-1 sm:gap-2">
                <Link
                  href={`/news/${article.category}/${article.slug}`}
                  className="flex-grow text-sm sm:text-base font-semibold leading-tight hover:text-hoverTitle transition-colors duration-200"
                  style={{
                    color: "rgb(var(--titleText))",
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.color = "rgb(var(--hoverTitle))")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.color = "rgb(var(--titleText))")
                  }
                >
                  {article.title}
                </Link>
                <span className="text-xs" style={{ color: "rgb(var(--tagText))" }}>
                  {formatLocalizedDate(article.publishedAt || new Date())}
                </span>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default LatestNews;
