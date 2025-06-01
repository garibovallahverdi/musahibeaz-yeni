"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules"; 
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import type { Article } from "@prisma/client";
import { api } from "~/trpc/react";

const Slider = () => {
  const { data: clientData, isLoading, isError, refetch } = api.public.article.galeryNews.useQuery();
  
  if (clientData?.article.length === 0) return null;

  return (
    <div className="relative w-full h-[250px]">
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={10}
        slidesPerView={1}
        navigation
        loop={true}
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1280: { slidesPerView: 4 },
          1536: { slidesPerView: 5 },
        }}
        className="w-full h-full"
      >
        {clientData?.article.map((article) => (
          <SwiperSlide key={article.id} className="relative w-full flex flex-col h-full">
            <Image
              src={article.imageUrl?.[0] ?? "/fallback-image.webp"}
              alt={article.title ?? "Slide"}
              width={600}
              height={600}
              objectFit="cover"
              className="absolute inset-0 w-[90%] h-[90%] mx-auto my-auto rounded-xl brightness-90 hover:brightness-100 transition-all duration-500"
              loading="lazy"
              onError={(e) => (e.currentTarget.src = "/fallback-image.webp")}
            />

            <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
              <div className="mx-auto">
                <Link
                  href={`/news/${article.category}/${article.slug}`}
                  className="mt-4 inline-block px-4 py-2 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                >
                  <h3 className="text-base line-clamp-2 mb-4 drop-shadow-2xl">
                    {article.title}
                  </h3>
                </Link>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

Slider.displayName = "Slider";
export default Slider;
