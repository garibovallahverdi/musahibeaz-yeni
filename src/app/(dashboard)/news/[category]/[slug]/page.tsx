import { Article } from "@prisma/client";
import { Metadata } from "next";
import ShowDetail from "~/app/(dashboard)/_components/ShowDetail";
import RelatedBox from "~/app/_components/common/RelatedBox";
import RelatedNewsCard from "~/app/_components/common/RelatedNewsCard";
import Slider from "~/app/_components/layout/Slider";
import { api } from "~/trpc/server";

type Params = Promise<{ slug: string, category: string }>;

export async function generateMetadata(props: { params: Params }): Promise<Metadata> {
  const { slug, category } = await props.params;
  const news = await api.public.article.getById({ slug });

  return {
    title: news?.title || "Xəbər Detayı",
    description: news?.description || "Ən son xəbərləri oxuyun.",
    alternates: { canonical: `https://musahibe.az/news/${category}/${slug}` },
    openGraph: {
      title: news?.title || "Xəbər Detayı",
      description: news?.description || "Ən son xəbərləri oxuyun.",
      url: `https://musahibe.az/news/${category}/${slug}`,
      images: [{ url: news?.imageUrl[0] ?? "/logo.jpg" }],
      type: "article",
    },
  };
}

export default async function Page(props: { params: Params }) {
  const { slug } = await props.params;
  const news = await api.public.article.getById({ slug });
  
  return (
    <div className="w-full max-w-7xl mx-auto py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Ana Haber İçeriği */}
         <ShowDetail news={news}/>

        {/* Oxsar Xəbərlər (Benzer Haberler) */}
        {news?.tags && <RelatedBox currentSlug={news.slug} tags={news.tags}/>}
      </div>
      <div className="flex flex-col">
        <div>
          <h2 className="text-2xl text-titleText pl-2">Son Xəbərlər</h2>
        </div>

               {/* <Slider/> */}
      </div>
      
    </div>
  );
}
