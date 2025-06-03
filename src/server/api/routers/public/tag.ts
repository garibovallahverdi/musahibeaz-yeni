import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ArticleStatus } from "@prisma/client";
export const tagPublicRouter = createTRPCRouter({

    listTag:publicProcedure
    .query(async ({ ctx, input }) => {
        try {
        
       const tags = await ctx.db.tag.findMany({
  where: {
    news: {
      some: {}, // yalnız news ilə əlaqəsi olan tag-lər
    },
  },
  orderBy: {
    news: {
      _count: 'desc',
    },
  },
  take: 8,
});
    

    
          return tags;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Taglar gətirilərkən xəta baş verdi. " + error.message);
          } else {
            throw new Error("Tag gətirilərkən bilinməyən bir xəta baş verdi.");
          }
        }
      }),


  getCategoryWithTags: publicProcedure
  .input(z.object({ 
    urlName: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    try {
      const category = await ctx.db.category.findFirst({
        where: { urlName: input.urlName },
        include: {
          tags: 
          {
            // orderBy: {
            //   news: {
            //     _count: 'desc',
            //   },
            // },
            take: 8,
          },
        },
      });

      if (!category) {
        throw new Error("❌Belə bir kateqoriya tapılmadı.");
      }
 
      return category;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(" ❌ Kateqoriya və taglar gətirilərkən xəta baş verdi. " + error.message);
      } else {
        throw new Error(" ❌ Kateqoriya və taglar gətirilərkən bilinməyən bir xəta baş verdi.");
      }
    }
  }),

  getTagByByValue: publicProcedure
  .input(z.object({ 
    tagValue: z.string(),
  }))
  .query(async ({ ctx, input }) => {
    try {
      const tag = await ctx.db.tag.findFirst({
        where: { tagValue: input.tagValue },
      });

   
      return tag;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(" ❌ Tag gətirilərkən xəta baş verdi. " + error.message);
      } else {
        throw new Error(" ❌ Tag gətirilərkən bilinməyən bir xəta baş verdi.");
      }
    }
  }),

      
  listTagByCategory: publicProcedure
  .input(z.object({
    limit: z.number(),
    category: z.string(), // bu categoryId-dir
  }))
  .query(async ({ ctx, input }) => {
    try {
      const tags = await ctx.db.tag.findMany({
        where: {
          categoryId: input.category,
          // news: {
          //   some: {}, // yalnız article ilə əlaqəsi olan taglər
          // },
        },
        orderBy: {
          // news: {
          //   _count: 'desc', // ən çox istifadə olunanlardan başla
          // },
        },
        take: input.limit,
      });

      return tags;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Taglar gətirilərkən xəta baş verdi. " + error.message);
      } else {
        throw new Error("Tag gətirilərkən bilinməyən bir xəta baş verdi.");
      }
    }
  }),




    getArticleBytag:publicProcedure
    .input(z.object({
         tag:z.string(),
         limit: z.number().min(1).max(50),
         cursor: z.string().optional(), 
         
    }))
      .query(async ({ ctx, input }) => {
        const { limit, cursor, tag } = input;
    
        try {
          const articles = await ctx.db.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
              tags: {
                some: {
                  tagValue: tag
                }
              }
            },
            select:{
              id: true,
              title: true,
              description: true,
              category: true,
              imageUrl: true,
              categorie: {
                select: {
                  name: true,
                  urlName: true,
                },
              },
              slug: true,
              publishedAt: true,
            },
            take: limit,
            skip: cursor ? 1 : 0, 
            cursor: cursor ? { id: cursor } : undefined, 
            orderBy: {
              publishedAt: 'desc',
            }
          });
    
          const count = await ctx.db.article.count({
            where: { status: ArticleStatus.PUBLISHED, tags: { some: { tagValue: tag } } }
          });
    
          // if (!articles.length) {
          //   throw new Error("Xəbər tapılmadı");
          // } 
          
          const nextCursor = articles.length === limit ? articles[articles?.length - 1]?.id : null;
    
          return {
            articles,
            count,
            nextCursor
          };
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Makale getirilirken hata oluştu: " + error.message);
          } else {
            throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
          }
        }
      }),

    getCategory: publicProcedure
    .query(async ({ ctx }) => {
      try {
        const categories = await ctx.db.category.findMany();

        // Kategorilerin her biri için makale sayısını kontrol et
        // const filteredCategories = await Promise.all(
        //   categories.map(async (category) => {
        //     const articleCount = await ctx.db.article.count({
        //       where: { category: category.name } 
        //     });
        //     return articleCount > 0 ? category : null; 
        //   })
        // );

        return categories

      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Kategoriler getirilirken hata oluştu: " + error.message);
        } else {
          throw new Error("Kategoriler getirilirken bilinmeyen bir hata oluştu");
        }
      }
    })
});
