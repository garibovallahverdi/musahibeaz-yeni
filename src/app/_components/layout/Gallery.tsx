"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import type { Article } from "@prisma/client";

const Carousel = ({ data }: { data: Article[] }) => {
  if (data.length === 0) return null;

  return (
    <div className="relative w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] overflow-hidden rounded-xl shadow-lg">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        navigation={true}
        pagination={{ clickable: true }}
        effect="fade"
        className="w-full h-full"
      >
        {data.map((article) => (
          <SwiperSlide key={article.id} className="relative w-full h-full">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent"></div>
            <Image
              src={article.imageUrl?.[0] ?? "/fallback-image.webp"}
              alt={article.title ?? "Slide"}
              layout="fill"
              objectFit="cover"
              className="brightness-90 hover:brightness-100 transition-all duration-500"
              priority
            />

            <div className="absolute bottom-6 left-6 right-6 text-white">
              <h3 className="text-xl sm:text-2xl font-semibold drop-shadow-md">
                {article.title}
              </h3>
              <p className="text-sm sm:text-base mt-2 line-clamp-2 opacity-80">
                {article.description}
              </p>
              <Link
                href={`/news/${article.category}/${article.slug}`}
                className="mt-4 inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Ətraflı Oxu
              </Link>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

Carousel.displayName = "Carousel";
export default Carousel;
