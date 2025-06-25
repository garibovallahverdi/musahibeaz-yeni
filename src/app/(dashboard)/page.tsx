import React from 'react';
import Carousel from '../_components/layout/Gallery';
import Steps from '../_components/layout/Steps';
import { api } from '~/trpc/server';
import LatestNews from '../_components/layout/LatestNews';
import MainPageCategpry from './_components/MainPageCategpry';

export const revalidate = 30;

const Home = async () => {
  const article = await api.public.article.galeryNews();
  const initialData = await api.public.article.getStepNews({ limit: 5, page: 1 });
  const initialData2 = await api.public.article.getStepNews({ limit: 20, page: 1 });

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-6 gap-4">

        {/* Sol taraf */}
        <div className="lg:col-span-4">
          {article && (
            <Carousel data={article.article} />
          )}

          {initialData.articles.length > 0 && (
            <Steps initialData={initialData} />
          )}

          <div className="flex flex-col gap-6">
            <MainPageCategpry category="i̇dman" header="İdman" />
            <MainPageCategpry category="turizm" header="Turizm" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
            <MainPageCategpry category="i̇qti̇sadi̇yyat" header="İqtisadiyyat" />
          </div>
        </div>

        {/* Sağ taraf: Scrollable Sticky Sidebar */}
        <div className="lg:col-span-2">
          <div className="sticky top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
            <LatestNews initialData={initialData2} />
          </div>
        </div>

      </div>
    </div>
  );
};

export default Home;
