import React from 'react';
import Carousel from '../_components/layout/Gallery';
import Steps from '../_components/layout/Steps';
import MainPageCategpry from './_components/MainPageCategpry';
import Slider from '../_components/layout/Slider';
import { api } from '~/trpc/server';

export const revalidate = 60;  // 60 saniyede bir yeniden oluşturulacak

const Home = async () => {
  // Veriyi server-side cache ile alıyoruz (Incremental Static Regeneration)
  const article = await api.public.article.galeryNews();
  const initialData = await api.public.article.getStepNews({ limit: 5, page: 1 });

  return (
    <div className="flex flex-col">
      {article && (
        <div className="flex flex-col ">
          <Carousel data={article.article} />
          <Slider />
        </div>
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
  );
};

export default Home;
