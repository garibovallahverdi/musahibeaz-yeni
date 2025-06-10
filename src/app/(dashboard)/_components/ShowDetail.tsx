"use client";
import React, { useState, useEffect } from 'react';
import { BsCalendar2 } from 'react-icons/bs';
import { IoEyeOutline } from 'react-icons/io5';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';
import { formatLocalizedDate } from '~/utils/dateFormater';
import { Article } from '@prisma/client';
import * as cheerio from "cheerio";
import Image from 'next/image';
import Link from 'next/link';
import ImageGallery from '../news/[category]/[slug]/_components/ImageGallery';

type News =  {
  id: string;
  title: string;
  content: string;
  description: string;
  slug: string;
  imageUrl: string[] | null;
  publishedAt: Date | null;
  galleryImages: string[] | null;
  category: string;
  tags: { name: string }[]; 
};

const ShowDetail = ({ news }: { news: News  }) => {
  const [baseFontSize, setBaseFontSize] = useState(16);
  const [modalImage, setModalImage] = useState<string | null>(null); // Modal için state
  const elementSizes = { h1: 32, h2: 28, p: 16, span: 14, li: 14, div: 16 }; // Varsayılan boyutlar

  const increaseFontSize = () => setBaseFontSize((prev) => Math.min(prev + 2, 30));
  const decreaseFontSize = () => setBaseFontSize((prev) => Math.max(prev - 2, 12));

  console.log(news, "news here");
  
  useEffect(() => {
    const content = document.querySelector(".news-detail-content");
    if (content) {
      Object.keys(elementSizes).forEach((tag) => {
        content.querySelectorAll(tag).forEach((el) => {
          (el as HTMLElement).style.fontSize = `${
            (elementSizes[tag as keyof typeof elementSizes] / 16) * baseFontSize
          }px`;
        });
      });
    }


    
  }, [baseFontSize, elementSizes]);

  const handleImageClick = (src: string) => {
    setModalImage(src); 
  };

  const closeModal = () => {
    setModalImage(null); // Modalı kapat
  };

  const cleanHTML = (html: string) => {
    const $ = cheerio.load(html);

    // Gereksiz etiketleri kaldır
    $("script, style, iframe, form, object, embed").remove();
    
    // Inline stil ve classları kaldır
    $("[style]").removeAttr("style");
    $("[class]").removeAttr("class");
  
    return $.html();
  };

  const optimizedContent = cleanHTML(news.content);

  useEffect(() => {
   
    const content = document.querySelector(".news-detail-content");
    if (content) {
      const images = content.querySelectorAll("img");
      images.forEach((img) => {
        img.addEventListener("click", () => handleImageClick(img.getAttribute("src") ?? ""));
        img.style.cursor = "pointer"; // Tıklanabilir hale getir
      });
    }
  
    return () => {
      const content = document.querySelector(".news-detail-content");
      if (content) {
        const images = content.querySelectorAll("img");
        images.forEach((img) => {
          img.removeEventListener("click", () => handleImageClick(img.getAttribute("src") ?? ""));
        });
      }
    }
  }, [optimizedContent, modalImage]); // optimizedContent değiştiğinde yeniden çalışır
  
  return (
    <div className="">
      <div className="flex justify-between text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <BsCalendar2 />
          {formatLocalizedDate(news.publishedAt ?? undefined)}
        </span>
       
      </div>

      <h1 className="md:text-3xl text-xl font-semibold text-titleText">{news.title}</h1>

      <div className="flex gap-4 my-4">
        <button onClick={increaseFontSize} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
          <AiOutlinePlus />
        </button>
        <button onClick={decreaseFontSize} className="p-2 bg-gray-200 rounded-md hover:bg-gray-300">
          <AiOutlineMinus />
        </button>
      </div>

      <div className="prose lg:prose-lg text-contentText space-y-6">
        {/* İçerikteki resimleri tıklanabilir hale getirme */}
        <div
          className="news-detail-content poppins-regular"
          dangerouslySetInnerHTML={{ __html: optimizedContent }}
        />
      </div>
             {
  news.galleryImages && (

    <ImageGallery images={news.galleryImages}/>
  )
 }
      <div className="flex gap-4 flex-col md:flex-row items-center text-sm text-gray-500">
        <span className="flex items-center gap-2">
          <BsCalendar2 />
          {formatLocalizedDate(news.publishedAt ?? undefined)}
        </span>
        <span className="flex items-center gap-2">
          <IoEyeOutline />
          {0}
        </span>

        <span className="flex items-center gap-2">
          <AiOutlinePlus />
          {news.category}
        </span>
        <span className="flex items-center gap-2">
  <AiOutlineMinus />
  {news.tags.map((tag, index) => (
      <Link key={tag.name} href={`/tag/${tag.name}`} className="text-blue-600 hover:underline">
        #{tag.name}
      </Link>
  ))}
</span>



      </div>
        
      {/* Modal */}
      {modalImage && (
        <div
          className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <Image
            src={modalImage}
            width={800}
            height={600}
            onClick={(e) => e.stopPropagation()} // Tıklamayı durdur
            className="max-w-[90%] max-h-[90%] rounded-lg shadow-lg"
            alt="Expanded"
          />
        </div>
      )}

    </div>
  );
};

export default ShowDetail;
