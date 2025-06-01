import React from 'react';
import Carousel from '../_components/layout/Gallery';
import Steps from '../_components/layout/Steps';
import MainPageCategpry from './_components/MainPageCategpry';
import Slider from '../_components/layout/Slider';
import { api } from '~/trpc/server';
import LatestNews from '../_components/layout/LatestNews';

export const revalidate = 30;  // 60 saniyede bir yeniden oluşturulacak

const Home = async () => {
  // Veriyi server-side cache ile alıyoruz (Incremental Static Regeneration)
  const article = await api.public.article.galeryNews();
  const initialData = await api.public.article.getStepNews({ limit: 5, page: 1 });
  const initialData2 = await api.public.article.getStepNews({ limit: 20, page: 1 });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-6 gap-2 ">
      <div className="lg:col-span-4">
      {article && (

          <Carousel
            data={article.article.map((a: any) => ({
              ...a,
              content: a.content ?? "",
              status: a.status ?? "DRAFT",
              createdAt: a.createdAt ?? new Date(),
              updatedAt: a.updatedAt ?? new Date(),
              authorId: a.authorId ?? "",
              categoryId: a.categoryId ?? null,
            }))}
          />
        
      )}
      {initialData.articles.length > 0 && <Steps initialData={initialData} />}

      {/* Kategoriler İçin Dinamik Veri */}
      <div className="flex flex-col gap-6">
        <MainPageCategpry category="İdman" />
        <MainPageCategpry category="Siyasət" />
        {/* <MainPageCategpry category="Elm və Texnologiya" /> */}
        {/* <MainPageCategpry category="Mədəniyyət" /> */}
      </div>

          </div>

      <div className="lg:col-span-2">
            
          <LatestNews initialData={initialData2} />
          </div>
    </div>
  );
};

export default Home;
