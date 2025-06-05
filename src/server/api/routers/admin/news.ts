import { z } from "zod";

import { adminProcedure, createTRPCRouter, editoreProcedure, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import slugify from 'slugify';
import { v4 as uuidv4 } from "uuid";
import { ArticleStatus } from "@prisma/client";
import redis from "~/server/redisClient";
import { ad } from "node_modules/better-auth/dist/shared/better-auth.purQujiV";
export const adminArticleRouter = createTRPCRouter({

   getById: adminProcedure
          .input(z.object({
            slug: z.string(),
          }))
          .query(async ({ ctx, input }) => {
            try {
              const article = await ctx.db.article.findUnique({
                where: { slug: input.slug },
                select: {
                  id: true,
                  title: true,
                  description: true,
                  content: true,
                  category: true,
                  imageUrl: true,
                  slug: true,
                  publishedAt: true,
                  status: true,
                  createdAt: true,
                  updatedAt: true,
                  author: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },

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
        
              return article;
            } catch (error) {
              if (error instanceof Error) {
                throw new Error("Makale getirilirken hata oluştu: " + error.message);
              } else {
                throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
              }
            }
          }),
  newsListAdmin: adminProcedure  
    .input(z.object({
      status: z.nativeEnum(ArticleStatus),
      page: z.number().min(1), 
      limit: z.number().min(1).max(50)
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input;
      const skip = (page - 1) * limit; 
      try {
        const article = await ctx.db.article.findMany({
          where: {  status:status , }, 
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });
      const count = await ctx.db.article.count({
        where:{status:status,}
      })
        if (!article) {
          throw new Error("Makale bulunamadı");
        }

        return {article,count};
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Makale getirilirken hata oluştu: " + error.message);
        } else {
          throw new Error("Makale getirilirken bilinmeyen bir hata oluştu");
        }
      }
    }),

    
    publish: adminProcedure
    .input(z.object({
      id: z.string(),
      slug: z.string().optional(), // Slug varsa cache key olarak kullanılabilir
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const article = await ctx.db.article.update({
          where: {
            id: input.id,
          },
          data: {
            status: ArticleStatus.PUBLISHED,
            publishedAt: new Date(),
          },
        });

        // Cache'i temizle
        const cacheKey = `article:${input.slug}`;
        await redis.del(cacheKey);

        return article;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Publish derken xeta bas verdi: " + error.message);
        } else {
          throw new Error("Publish ederken bilinmeyen bir xeta bas verdi");
        }
      }
    }),

  archived: adminProcedure
    .input(z.object({
      id: z.string(),
      slug: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const article = await ctx.db.article.update({
          where: {
            id: input.id,
          },
          data: {
            status: ArticleStatus.ARCHIVED,
            publishedAt: new Date(),
          },
        });

        // Cache'i temizle
        const cacheKey = `article:${input.slug}`;
        await redis.del(cacheKey);

        return article;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("Archive derken xeta bas verdi: " + error.message);
        } else {
          throw new Error("Archive ederken bilinmeyen bir xeta bas verdi");
        }
      }
    }),

createCategory: adminProcedure
  .input(
    z.object({
      category: z.string().min(2, "Minimum 2 hərf olmalıdır"),
      parentId: z.string().uuid().optional(), // Eğer varsa sub-category olur
    })
  )
  .mutation(async ({ ctx, input }) => {
    const rawCategory = input.category.toLowerCase().trim();

    // normalize kelimeleri tek tek ve tre ile birleştir
    const normalizeCategoryValue = rawCategory
      .split(" ")
      .map((word) =>
        word
          .replace(/ı/g, "i")
          .replace(/ə/g, "e")
          .replace(/ü/g, "u")
          .replace(/ç/g, "c")
          .replace(/ş/g, "s")
          .replace(/ğ/g, "g")
      )
      .join("-");

    // Aynı isimle kategori var mı?
    const exists = await ctx.db.category.findUnique({
      where: { name: rawCategory },
    });

    if (exists) throw new Error("Məlumat zatən mövcuddur.");

    // Yeni kategoriyi oluştur
    const newCategory = await ctx.db.category.create({
      data: {
        name: rawCategory,
        urlName: normalizeCategoryValue,
        parentId: input.parentId ?? null, // Main veya Sub kategori
      },
    });

    return {
      success: true,
      message: input.parentId
        ? "Alt kateqoriya yaradıldı."
        : "Ana kateqoriya yaradıldı.",
      category: newCategory,
    };
  }),

  getAllCategory: adminProcedure
  .query(async({ctx})=>{
    try {
     


      const categories = await ctx.db.category.findMany();
      if (!categories || categories.length === 0) {
       return null
      }
      // Kategorileri slugify ile düzenleme
      // categories.forEach(category => {
      //   category.slug = slugify(category.name, {
      //     lower: true,
      //     strict: true,
      //   });
      // });
      
      return categories

    
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Categoryleri getirerken xeta bas verdi: " + error.message);
      } else {
        throw new Error("Categoryleri getirerken bilinmeyen bir xeta bas verdi");
      }
    }
  })
  
});
