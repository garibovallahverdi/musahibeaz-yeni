import Image from "next/image";
import Link from "next/link";
import React from "react";
import { FiCalendar } from "react-icons/fi";
import { formatLocalizedDate } from "~/utils/dateFormater";

type Article = {
category: string;
  slug: string;
  title: string;
  description: string;
  imageUrl: string[] | null;
  publishedAt: Date | null;
  id: string;
}
const NewsCard = ({ article }: { article: Article }) => {
  return (
    <div className="bg-  rounded-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1">
      <Link href={`/news/${article.category}/${article.slug}`} className="block group">
        {/* Resim Alanı */}
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={article.imageUrl?.[0] ?? "/fallback-image.webp"}
            alt={article.title}
            width={600}
            height={600}
            objectFit="cover"
            loading="lazy"
            className="transition-transform w-full h-full duration-500 group-hover:scale-110"
          />
          {/* Kategori Etiketi */}
          <span className="absolute top-2 left-2 bg-buttonBg text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
            {article.category}
          </span>
        </div>

        {/* İçerik Alanı */}
        <div className="p-2 text-contentText">
          {/* Tarih */}
          <div className="flex items-center text-sm text-gray-500 mb-2">
            <FiCalendar className="text-md text-gray-400 mr-2" />
            {formatLocalizedDate(article?.publishedAt ?? undefined)}
          </div>

          {/* Başlık */}
          <h2 className="text-lg font-semibold text-titleText mb-2 line-clamp-2 group-hover:text-blue-700 transition-colors duration-300">
            {article.title}
          </h2>

          {/* Açıklama */}
          <p className="text-sm  line-clamp-2 mb-3">
            {article.description}
          </p>

       
        </div>
      </Link>
    </div>
  );
};

export default NewsCard;
