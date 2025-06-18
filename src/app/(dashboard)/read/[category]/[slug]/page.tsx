import { Article } from "@prisma/client";
import { Metadata } from "next";
import ShowDetail from "~/app/(dashboard)/_components/ShowDetail";
import RelatedBox from "~/app/_components/common/RelatedBox";
import RelatedNewsCard from "~/app/_components/common/RelatedNewsCard";
import LatestNews from "~/app/_components/layout/LatestNews";
import Slider from "~/app/_components/layout/Slider";
import { api } from "~/trpc/server";

type Params = Promise<{ slug: string, category: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug} = await props.params;
  const news = await api.public.article.getById({ slug });
 
  return {
    title: news?.title || "Xəbər Detayı",
    description: news?.description || "Ən son xəbərləri oxuyun.",
    alternates: { canonical: `https://musahibe.az/read/${news.categorie?.urlName}/${news.slug}` },
    openGraph: {
      title: news?.title || "Xəbər Detayı",
      description: news?.description || "Ən son xəbərləri oxuyun.",
      url: `https://musahibe.az/read/${news.categorie?.urlName}/${news.slug}`,
      images: [{ url: news?.imageUrl[0] ?? "/logo.jpg" }],
      type: "article",
    },
  };
}
                  
export default async function Page(props: { params: Params }) {
  const { slug } = await props.params;
  const news = await api.public.article.getById({ slug });
    const initialData2 = await api.public.article.getStepNews({ limit: 8, page: 1 });
  
    
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Ana Haber İçeriği */}
        <div className="lg:col-span-2 space-y-6">

         <ShowDetail news={news}/>
        {news?.tags && <RelatedBox category="Vacib Xəbərlər" currentSlug={news.slug} tags={news.tags}/>}
        </div>


        {/* Oxsar Xəbərlər (Benzer Haberler) */}
        
        <div className="lg:col-span-1 space-y-6">

        {news?.tags && <RelatedBox category="Oxşar Xəbərlər" currentSlug={news.slug} tags={news.tags}/>}
                  <LatestNews initialData={{
                      articles: initialData2.articles.map(article => ({
                          ...article,
                          categorie: article.categorie ,
                      })),
                      totalPages: initialData2.totalPages,
                  }} />
        </div>
        
      </div>
      <div className="flex flex-col">
        <div>
        </div>

               {/* <Slider/> */}
      </div>
      
    </div>
  );
}
