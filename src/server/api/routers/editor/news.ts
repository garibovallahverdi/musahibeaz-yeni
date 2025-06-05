import { z } from "zod";

import { adminProcedure, createTRPCRouter, editoreProcedure, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import slugify from 'slugify';
import { v4 as uuidv4 } from "uuid";
import { ArticleStatus } from "@prisma/client";
import redis from "~/server/redisClient";
import { TRPCError } from "@trpc/server";
export const editorArticleRouter = createTRPCRouter({

create: editoreProcedure
    .input(z.object({
      title: z.string().min(1, "Başlıq gereklidir"),
      content: z.string().min(1, "Content gereklidir"),
      category: z.string().min(1, "Kategory gereklidir"),
      description: z.string().min(10, "Aciqlama gereklidir "),
      imagesUrl: z.array(z.string()).optional(), // Ana içerik görselleri
      galleryImages: z.array(z.string()).optional(), // Galeri görselleri
      tags: z.array(z.string()).optional(),
      multimedia: z.boolean().optional().default(false), // <-- YENİ EKLENDİ: multimedia alanı
    }))
    .mutation(async ({ ctx, input }) => {
      const slugText = slugify(input.title, {
        lower: true,
        strict: true,
      });
      const uniqueId = uuidv4();
      const slug = slugText + "-" + uniqueId; // Slug'ı benzersiz hale getirin

      try {
        const categories = await ctx.db.category.findFirst({
          where: { urlName: input.category },
        });

        if (!categories) {
            throw new TRPCError({
                code: "BAD_REQUEST",
                message: "Seçilen kategori bulunamadı."
            });
        }

        const article = await ctx.db.article.create({
          data: {
            title: input.title,
            slug,
            authorId: ctx.auth.user.id,
            content: input.content,
            category: input.category,
            status: "DRAFT", // Or whatever default status you want
            description: input.description,
            categoryId: categories.id,
            imageUrl: input.imagesUrl ?? [],
            galleryImages: input.galleryImages ?? [],
            multimedia: input.multimedia, // <-- YENİ EKLENDİ: multimedia değerini ata
            tags: {
              connect: input?.tags?.map((tag) => ({ name: tag })) ?? []
            }
          },
        });
        return article;
      } catch (error) {
        if (error instanceof TRPCError) {
            throw error; // TRPCError'ları doğrudan fırlat
        } else if (error instanceof Error) {
            console.error("Makale oluşturulurken hata:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Makale oluşturulurken bir hata oluştu: " + error.message,
                cause: error
            });
        } else {
            console.error("Makale oluşturulurken bilinmeyen bir hata:", error);
            throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Makale oluşturulurken bilinmeyen bir hata oluştu",
                cause: error
            });
        }
      }
    }),


    update: editoreProcedure
  .input(z.object({
    id: z.string().min(1, "ID gereklidir"),
    title: z.string().min(1, "Başlıq gereklidir").optional(),
    content: z.string().min(1, "Content gereklidir").optional(),
    category: z.string().min(1, "Kategory gereklidir").optional(),
    description: z.string().min(10, "Açıqlama gereklidir").optional(),
    imagesUrl: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    status: z.enum(["DRAFT", "PUBLISHED"]).optional()
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      // First get the existing article to check ownership
      const existingArticle = await ctx.db.article.findUnique({
        where: { id: input.id },
        include: { tags: true }
      });

      if (!existingArticle) {
        throw new Error("Makale bulunamadı");
      }

      // Check if the user is the author
      if (existingArticle.authorId !== ctx.auth.user.id) {
        throw new Error("Bu makaleyi güncelleme yetkiniz yok");
      }

      const categories = await ctx.db.category.findFirst({
        where: { urlName: input.category },
      });
      if (!categories) {
        throw new Error("Belirtilen kategori bulunamadı");
      }
      // Prepare data for update
      const updateData: Partial<{
        title: string;
        content: string;
        category: string;
        description: string;
        imageUrl: string[];
        categoryId: string;
        status: ArticleStatus;
        slug: string;
        tags: { connect: { name: string }[] };
      }> = {
        title: input.title,
        content: input.content,
        category: input.category,
        categoryId: categories.id,
        description: input.description,
        imageUrl: input.imagesUrl,
        status: input.status
      };

      // Only update slug if title changed
      if (input.title && input.title !== existingArticle.title) {
        const slugText = slugify(input.title, {
          lower: true,
          strict: true,
        });
        const uniqueId = uuidv4();
        updateData.slug = slugText + uniqueId;
      }

      // Handle tags update
      if (input.tags) {
        // First disconnect all existing tags
        await ctx.db.article.update({
          where: { id: input.id },
          data: {
            tags: {
              set: []
            }
          }
        });

        // Then connect the new tags
        updateData.tags = {
          connect: input.tags.map((tag) => ({ name: tag }))
        };
      }

      const updatedArticle = await ctx.db.article.update({
        where: { id: input.id },
        data: updateData,
        include: {
          tags: true
        }
      });

      return updatedArticle;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Makale güncellenirken hata oluştu: " + error.message);
      } else {
        throw new Error("Makale güncellenirken bilinmeyen bir hata oluştu");
      }
    }
  }),


  getById: editoreProcedure
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
                  galleryImages:true,
                  multimedia:true,
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
  newsListEditor: editoreProcedure
    .input(z.object({
      authorId: z.string().optional(),
      status: z.nativeEnum(ArticleStatus),
      page: z.number().min(1), 
      limit: z.number().min(1).max(50)
    }))
    .query(async ({ ctx, input }) => {
      const { page, limit, status } = input;
      const skip = (page - 1) * limit; 
      try {
        const article = await ctx.db.article.findMany({
          where: {  status:status , authorId: input.authorId }, 
          skip,
          take: limit,
          orderBy: {
            createdAt: 'desc',
          },
        });
      const count = await ctx.db.article.count({
        where:{status:status, authorId: input.authorId}
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


  getAllCategory: editoreProcedure
  .query(async({ctx})=>{
    try {
     


      const categories = await ctx.db.category.findMany();
      if (!categories || categories.length === 0) {
        throw new Error("Kategoriler bulunamadı");
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
