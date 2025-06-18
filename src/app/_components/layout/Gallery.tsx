"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade, Thumbs, Controller } from "swiper/modules";
import Image from "next/image";
import Link from "next/link";

// Swiper CSS importları
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import "swiper/css/effect-fade";
import "swiper/css/thumbs"; // Başparmak görselleri için CSS

// Veri tipi

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
const Carousel = ({ data }: { data: Article[] }) => {
  // Başparmak (thumbnails) Swiper örneğini tutacak state
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
  const [thumbsSwiper, setThumbsSwiper] = useState<any>(null);

  if (data.length === 0) return null;

  return (
    <div className="relative w-full  overflow-hidden rounded-xl shadow-2xl bg-gray-900 "> {/* Arka plan rengi eklendi */}
      {/* Ana Carousel Bölümü */}
      <div className="relative w-full h-[280px] sm:h-[350px] md:h-[450px] max-h-[450px]  mb-4">
        <Swiper
          modules={[Navigation, Pagination, Autoplay, EffectFade, Thumbs, Controller]}
          slidesPerView={1}
          autoplay={{
            delay: 4000, // Gecikme biraz artırıldı
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          // navigation={true}
          // pagination={{ clickable: true, dynamicBullets: true }}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          thumbs={{ swiper: thumbsSwiper }}
          className="w-full h-full"
        >
          {data.map((article) => (
            <SwiperSlide key={article.id} className="relative w-full h-full group">
              {/* Metin okunurluğunu ve modern hissi artıran degrade katman */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10"></div> {/* from-black/90 daha koyu */}

              {/* Ana görsel */}
              <Image
                src={article.imageUrl?.[0] ?? "/fallback-image.webp"}
                alt={article.title || "Haber Görseli"}
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 ease-out group-hover:scale-105"
                priority
              />

              {/* İçerik Kutusu - Daha fazla sol boşluk */}
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 text-white z-20">
                {/* Kategori Etiketi - Daha belirgin */}
                {article.category && (
                  <span className="inline-block bg-blue-700 bg-opacity-90 text-[10px] sm:text-sm font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider shadow-lg"> {/* bg-opacity-90 ve shadow-lg */}
                    {article.categorie.name }
                  </span>
                )}
                
                {/* Başlık - Daha büyük ve daha net */}
                <h3 className="text-sm sm:text-3xl  font-extrabold leading-tight mb-3 drop-shadow-xl"> {/* Boyutlar ve mb-3 artırıldı */}
                  <Link href={`/read/${article.categorie.urlName}/${article.slug}`} className="hover:text-gray-100 transition-colors duration-300"> {/* hover:text-gray-100 daha net */}
                    {article.title}
                  </Link>
                </h3>

                {/* Açıklama - Daha iyi okunurluk */}
                {/* <span className="text-sm sm:text-base hidden md:block md:text-lg mt-2 line-clamp-3  opacity-95 drop-shadow-md"> opacity-95 */}
                <span className="line-clamp-3 text-xs sm:text-sm  mt-2 opacity-90 drop-shadow-md">
                  {article.description}
                </span>

                {/* Devamını Oku Butonu - Daha vurucu */}
                {/* <Link
                  href={`/news/${article.category}/${article.slug}`}
                  className="mt-6 inline-flex items-center justify-center bg-red-700 hover:bg-red-800 text-white text-sm lg:text-base px-4 py-2 lg:px-7 lg:py-3 font-semibold rounded-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-0.5" // Daha koyu kırmızı, daha fazla padding
                >
                  Ətraflı Oxu
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L12.586 12H4a1 1 0 110-2h8.586l-2.293-2.293a1 1 0 111.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path></svg>
                </Link> */}
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Başparmak (Thumbnail) Carousel Bölümü */}
      <div className="w-full px-2 py-4 sm:px-4 mt-2">
        <Swiper
          onSwiper={(swiper) => setThumbsSwiper(swiper)}
          spaceBetween={10}
          slidesPerView={3}
          freeMode={true}
          watchSlidesProgress={true}
          modules={[Navigation, Thumbs, Controller]}
          navigation={true}
          className="mySwiperThumbs w-full h-[80px] sm:h-[100px] md:h-[120px] lg:h-[140px] xl:h-[160px]"
          breakpoints={{
            // 640: {
            //   slidesPerView: 1,
            //   spaceBetween: 15,
            // },
            // 768: {
            //   slidesPerView: 5,
            //   spaceBetween: 20,
            // },
            // 1024: {
            //   slidesPerView: 5,
            //   spaceBetween: 25,
            // },
            // 1280: {
            //   slidesPerView: 5,
            //   spaceBetween: 10,
            // },
          }}
        >
          {data.map((article) => (
            <SwiperSlide
              key={article.id}
              // Aktif/hover durumları için daha belirgin ve şık geçişler
              className="relative bg-white max-h-28 rounded-lg overflow-hidden group border-2 border-transparent transition-all duration-300
                         swiper-slide-thumb-active:border-blue-500 swiper-slide-thumb-active:scale-105 swiper-slide-thumb-active:opacity-100 opacity-60 hover:opacity-90" 
            >
              <Image
                src={article.imageUrl?.[0] ?? "/fallback-image.webp"}
                alt={`Küçük görsel: ${article.title || "Haber"}`}
                layout="fill"
                objectFit="cover"
                className="rounded-lg max-h-28 group-hover:scale-105 transition-transform duration-300" // Thumbnail üzerinde de zoom efekti
              />
              {/* Başparmakların üzerine daha belirgin koyu katman, aktifte kalkar */}
              <div className="absolute inset-0 bg-black/50 group-hover:bg-transparent transition-colors duration-300"></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

Carousel.displayName = "Carousel";
export default Carousel;