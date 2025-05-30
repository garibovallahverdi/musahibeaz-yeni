import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { ArticleStatus } from "@prisma/client";
export const tagPublicRouter = createTRPCRouter({

    listTag:publicProcedure
    .query(async ({ ctx, input }) => {
        try {
        
          const tags = await ctx.db.tag.findMany({
            take: 8,
            orderBy: {
              news: {
                _count: 'desc'  
              }
            }, 
                  
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
    .query(async({ctx,input})=>{

      const { limit, tag, cursor } = input;
        try {
            const articles = await ctx.db.article.findMany({
                where:{
                    tags:{
                         some:{
                            name:tag 
                         }   
                    }
                },
                take: limit,
                skip: cursor ? 1 : 0, 
                cursor: cursor ? { id: cursor } : undefined, 
                orderBy: {
                  publishedAt: 'desc',
                }
            })

            const count = await ctx.db.article.count({
              where:{
                  tags:{
                       some:{
                          name:tag
                       }   
                  }
              },
              
          })
          

          const nextCursor = articles.length === limit ? articles[articles?.length - 1]?.id : null;
    
          return {
            articles,
            count,
            nextCursor
          }
            
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
        const filteredCategories = await Promise.all(
          categories.map(async (category) => {
            const articleCount = await ctx.db.article.count({
              where: { category: category.name } 
            });

            return articleCount > 0 ? category : null; 
          })
        );

        return filteredCategories.filter(Boolean); // Null olanları kaldır

      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Kategoriler getirilirken hata oluştu: " + error.message);
        } else {
          throw new Error("Kategoriler getirilirken bilinmeyen bir hata oluştu");
        }
      }
    })
});
