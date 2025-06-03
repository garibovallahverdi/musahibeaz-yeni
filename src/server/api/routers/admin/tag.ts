import { z } from "zod";

import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Fuse from "fuse.js";

export const adminTagRouter = createTRPCRouter({

   create: adminProcedure
  .input(z.object({
    tag: z.string().min(2, "Minimum 2 hərf olmalıdır"),
    categoryId: z.string()
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      const rawTag = input.tag.toLowerCase().trim();

      // Zaten var mı kontrolü
      const exsistTag = await ctx.db.tag.findUnique({
        where: {
          name: rawTag,
        },
      });

      if (exsistTag) {
        throw new Error("Məlumat zatən mövcuddur.");
      }

      // normalize kelimeleri tek tek ve tre ile birleştir
      const normalizeTagvalue = rawTag
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

      const newTag = await ctx.db.tag.create({
        data: {
          name: rawTag,
          tagValue: normalizeTagvalue,
          categoryId: input.categoryId,
        },
      });

      return newTag;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Tag yaradılarkən xəta baş verdi. " + error.message);
      } else {
        throw new Error("Tag yaradılarkən bilinməyən bir xəta baş verdi.");
      }
    }
  }),



    remove: adminProcedure
    .input(z.object({
        tag:z.string()
    }))
    .mutation(async({ctx, input})=>{
        try {
            const deleteTag = await ctx.db.tag.delete({
                where:{
                    name:input.tag.toLowerCase().trim(),
                }
            }) 

            if(!deleteTag){
                throw new Error("Məlumat zatən mövcud deyil.")
            }


            return deleteTag
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("Tag yaradilarkən xəta baş verdi. " + error.message);
              } else {
                throw new Error("Tag yaradılarkən bilinməyən bir xəta baş verdi.");
              }
        }
    }),

    list:adminProcedure
    .input(z.object({
        search:z.string().optional()
    }))
    .query(async ({ ctx, input }) => {
        try {
          // Tüm tagleri getir
          const tags = await ctx.db.tag.findMany();
    
          // Eğer search parametresi yoksa, tüm tagleri döndür
          if (!input.search) {
            return tags;
          }
          const normalizedTags = tags.map((tag) => ({
            original: tag, // Orijinal veriyi sakla
            normalized: {   
              ...tag,
              name: normalizeText(tag.name),
              
            },
          }));

          // Fuse.js ayarları
          
          const fuse = new Fuse(normalizedTags, {
            keys: ["normalized.name"], // Hangi alanlarda arama yapılacağını belirtiyoruz
            threshold: 0.6, // Hassasiyet ayarı (düşük değer daha kesin eşleşmeler getirir)
            includeScore: false,
          });

              const normalizedSearch = normalizeText(input.search);
              
              
              
              const results = fuse.search(normalizedSearch)
         
              const newResult = results.map((tag) => tag.item.original);

    
          return newResult;
        } catch (error) {
          if (error instanceof Error) {
            throw new Error("Taglar gətirilərkən xəta baş verdi. " + error.message);
          } else {
            throw new Error("Tag gətirilərkən bilinməyən bir xəta baş verdi.");
          }
        }
      })
});


const normalizeText =(text: string)=> {
    return text.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ə/g, "e") 
    .toLowerCase(); // Diakritikleri kaldır ve küçük harfe çevir
  }