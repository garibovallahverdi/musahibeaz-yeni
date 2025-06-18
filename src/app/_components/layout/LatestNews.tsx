"use client";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatLocalizedDate } from "~/utils/dateFormater";

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
const LatestNews = ({
  initialData,
}: {
  initialData: { articles: Article[]; totalPages: number };
}) => {
  const articles = initialData.articles;

  return (
    <div className="w-full">
      <h2 className="mb-4 pl-2 text-2xl font-bold text-titleText sm:pl-4">
        Son Xəbərlər
      </h2>

      {/* GRID — xs/sm → 2 kolon   md → 3 kolon   lg+ → 1 kolon  */}
      <ul className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-1">
        {articles.map((article) => (
          <motion.li
            key={article.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="flex items-center gap-4 rounded-lg border p-3 font-normal transition duration-200 ease-in-out "
            style={{
              backgroundColor: "rgb(var(--card_bg))",
              color: "rgb(var(--contentText))",
              borderColor: "rgb(var(--border))",
            }}
          >
            {/* Küçük ekranlarda görsel, lg’de gizli */}
            {article.imageUrl?.[0] && (
              <div className="relative h-16 w-20 flex-shrink-0 overflow-hidden rounded sm:h-20 sm:w-24 lg:hidden">
                <Image
                  src={article.imageUrl[0]}
                  alt={article.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex flex-col flex-grow gap-1 sm:gap-2">
              <Link
                href={`/read/${article.categorie.urlName}/${article.slug}`}
                className="text-sm font-semibold leading-tight transition-colors duration-200 "
                style={{ color: "rgb(var(--titleText))" }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = "rgb(var(--hoverTitle))")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = "rgb(var(--titleText))")
                }
              >
                {article.title}
              </Link>

              <span
                className="text-xs"
                style={{ color: "rgb(var(--tagText))" }}
              >
                {formatLocalizedDate(article.publishedAt ?? new Date())}
              </span>
            </div>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

export default LatestNews;
