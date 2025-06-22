import React from 'react';
import NewsCard from '~/app/_components/common/NewsCard';
import { api } from '~/trpc/server';

const MainPageCategpry = async ({ category, header }: { category: string , header:string}) => {
  const limit = 3;

  // Veriyi server-side cache ile alıyoruz (ISR)
  const article = await api.public.article.getNewsBySubCategory(
    { category, limit, cursor: undefined },
  );

  return (
    <div className="w-full flex flex-col gap-5">
      <p className="text-2xl text-titleText pl-2 ">{header}</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 lg:grid-cols-3">
        {article.articles
          .filter((item) => item.categorie !== null)
          .map((item) => (
            <NewsCard article={item as Omit<typeof item, 'categorie'> & { categorie: { name: string; urlName: string } }} key={item.id} />
          ))}
      </div>
    </div>
  );
};

export default MainPageCategpry;
