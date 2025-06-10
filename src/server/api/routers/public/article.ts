import { z } from "zod";
import Fuse from "fuse.js";
import redis from "~/server/redisClient";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import slugify from 'slugify';
import { v4 as uuidv4 } from "uuid";
import { Article, ArticleStatus, Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
export const articleRouter = createTRPCRouter({


    galeryNews: publicProcedure
      .query(async ({ ctx, input }) => {
        try {
          const article = await ctx.db.article.findMany({
            where: { status:ArticleStatus.PUBLISHED  },
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              imageUrl: true,
              slug: true,
              publishedAt: true,
               categorie: {
                select: {
                  name: true,
                  urlName: true,
                },
              },
            },
            orderBy: {
              publishedAt: 'desc',
            },
            take: 8, 
          });
      
          if (!article) {
            throw new Error("Makale bulunamadı");
          }
  
          return {article};
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Makale getirilirken hata oluştu: " + error.message);
          } else {
            throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
          }
        }
      }),
      
      getNewsByCategory: publicProcedure
      .input(z.object({
        limit: z.number(),
        cursor: z.string().optional(), 
        category: z.string()
      }))
      .query(async ({ ctx, input }) => {
        const { limit, cursor, category } = input;
    
        try {
          const articles = await ctx.db.article.findMany({
            where: {
              status: ArticleStatus.PUBLISHED,
              category
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
            where: { status: ArticleStatus.PUBLISHED, category }
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
    


      getById: publicProcedure
      .input(z.object({
        slug: z.string(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // const cacheKey = `article:${input.slug}`;
    
          // // ✅ 1. Önce Redis Cache'den kontrol et
          // const cachedArticle = await redis.get(cacheKey);
          // if (cachedArticle) {
          //   console.log("♻️ Cache'den çekildi:", cacheKey);
          //   return JSON.parse(cachedArticle) as Article & { tags: { name: string }[] };
          // }
    
          // 🚀 2. Cache'de yoksa veritabanından çek
          const article = await ctx.db.article.findUnique({
            where: { slug: input.slug, status:ArticleStatus.PUBLISHED },
            select: {
              id: true,
              title: true,
              description: true,
              content: true,
              category: true,
              imageUrl: true,
              galleryImages:true,
              slug: true,
              publishedAt: true,
              tags: {
                select: {
                  name: true,
                },
              },
            },  
          });
    
          if (!article) {
            throw new Error("Makale bulunamadı");
          }
    
          // await redis.set(cacheKey, JSON.stringify(article), "EX", 600);
          // console.log("📌 Cache'e eklendi:", cacheKey);
    
          return article;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Makale getirilirken hata oluştu: " + error.message);
          } else {
            throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
          }
        }
      }),

    getRelatedNews: publicProcedure
    .input(
      z.object({
        currentSlug: z.string(), 
        tags: z.array(
          z.object({
            name: z.string(),
          })
        ),
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const tagNames = input.tags.map(tag => tag.name); 
  
        const news = await ctx.db.article.findMany({
          where: {
            slug: { not: input.currentSlug }, 
            status: ArticleStatus.PUBLISHED,
            tags: {
              some: {
                name: {
                  in: tagNames,
                },
              }, 
            },
          },
          select: {
            id: true,
            title: true,
            description: true,
            category: true,
            imageUrl: true,
            slug: true,
            publishedAt: true,
            categorie: {
              select: {
                name: true,
                urlName: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',  
          },
          take: 6
        });
  
        return news; 
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Makale getirilirken hata oluştu: " + error.message);
        } else {
          throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
        }
      }
    }),




    getStepNews: publicProcedure
  .input(z.object({
    page: z.number().default(1), // Sayfa numarası
    limit: z.number().default(10), // Sayfa başına kaç haber
  }))
  .query(async ({ ctx, input }) => {
    const { page, limit } = input;

    try {
      const articles = await ctx.db.article.findMany({
        where: { status: ArticleStatus.PUBLISHED },
        take: limit,
        skip: (page - 1) * limit, // Sayfaya göre kaydırma işlemi
        orderBy: { publishedAt: 'desc' },
        include:{
          categorie:true
        }
      });

      const totalCount = await ctx.db.article.count({
        where: { status: ArticleStatus.PUBLISHED },
      });

      return {
        articles,
        totalPages: Math.ceil(totalCount / limit),
      };
    } catch (error) {
      if(error instanceof Error) {
        throw new Error("Makaleler alınırken hata oluştu: " + error.message);
      } else {
        throw new Error("Makaleler alınırken bilinmeyen bir hata oluştu");
      } 
    }
  }),


  // search : publicProcedure
  // .input(
  //   z.object({
  //     limit: z.number().min(1).max(100).default(10),
  //     cursor: z.string().nullish(),
  //     search: z.string().optional(),
  //   })
  // )
  // .query(async ({ ctx, input }) => {
  //   try {
  //     // Generate unique cache key
  //     const cacheKey = `search:${input.search ?? 'all'}:${input.cursor ?? 0}:${input.limit}`;
      
  //     // Check Redis cache first
  //     const cachedResult = await redis.get(cacheKey);
  //     if (cachedResult) {
  //       return JSON.parse(cachedResult) as { articles: any[], nextCursor: string | null, searchTerm: string | undefined, cached: boolean };
  //     }

  //     // Database query conditions
  //     const where: Prisma.ArticleWhereInput = input.search
  //       ? {
  //           OR: [
  //             { title: { contains: input.search, mode: 'insensitive' } },
  //             { description: { contains: input.search, mode: 'insensitive' } },
  //             // For PostgreSQL full-text search (uncomment if using PostgreSQL):
  //             // {
  //             //   $text: {
  //             //     $search: input.search,
  //             //     $caseSensitive: false,
  //             //     $diacriticSensitive: false
  //             //   }
  //             // }
  //           ],
  //         }
  //       : {};

  //     // Execute query with cursor pagination
  //     const articles = await ctx.db.article.findMany({
  //       where,
  //       take: input.limit + 1, // Fetch one extra to check for next page
  //       cursor: input.cursor ? { id: input.cursor } : undefined,
  //       orderBy: { publishedAt: 'desc' }, // Or your preferred ordering
  //       select: {
  //         id: true,
  //         title: true,
  //         description: true,
  //         publishedAt: true,
  //         category: true,
  //         imageUrl: true,
  //         slug: true,
  //         // Only select fields you need
  //       },
  //     });

  //     // Determine next cursor
  //     let nextCursor: string | undefined = undefined;
  //     if (articles.length > input.limit) {
  //       const nextItem = articles.pop();
  //       nextCursor = nextItem?.id;
  //     }

  //     // Prepare response
  //     const result = {
  //       articles,
  //       nextCursor,
  //       searchTerm: input.search,
  //       cached: false,
  //     };

  //     // Cache results in Redis (60 seconds TTL)
  //     await redis.setex(cacheKey, 60, JSON.stringify({
  //       ...result,
  //       cached: true
  //     }));

  //     return {
  //       articles,
  //       nextCursor,
  //       searchTerm: input.search,
  //       cached: false,
  //     };
  //   } catch (error) {
  //     console.error('Search error:', error);
  //     throw new TRPCError({
  //       code: 'INTERNAL_SERVER_ERROR',
  //       message: 'Search operation failed',
  //     });
  //   }
  // }),


  
}); 


const normalizeText =(text: string)=> {
  return text.normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/ə/g, "e") 
  .toLowerCase(); 
}
