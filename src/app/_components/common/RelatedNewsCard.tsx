import { Article } from '@prisma/client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { formatLocalizedDate } from '~/utils/dateFormater';

const RelatedNewsCard = ({ data }: { data: Article }) => {
  return (
    <div className="bg-card_bg   rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300">
      <Link href={`/news/${data.category}/${data.slug}`}>
        <div className="flex flex-col lg:flex-row h-full">
          {/* Resim Bloğu */}
          <div className="relative w-full lg:w-24 h-40 lg:h-20 flex-shrink-0">
            <Image
              src={data.imageUrl[0] ?? "/placeholder.jpg"} // Fallback resim
              alt={data.title}
              layout="fill"
              objectFit="cover"
              className="rounded-l-lg"
            />
          </div>

          {/* Yazı Bloğu */}
          <div className="flex flex-col justify-between p-2 flex-grow">
            {/* Başlık */}
            <h2 className="text-sm font-medium text-titleText  hover:text-hoverTitle line-clamp-2 transition-colors duration-300">
              {data.title}
            </h2>

            {/* Tarih ve Görüntülenme Bilgisi */}
            <div className="mt-1 flex items-center text-xs text-tagText ">
              <span>{formatLocalizedDate(data.publishedAt ?? undefined)}</span>
              <span className="mx-1">•</span>
              <span>{ 0} baxış</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default RelatedNewsCard;