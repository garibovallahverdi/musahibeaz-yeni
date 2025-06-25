import { z } from "zod";

import { adminProcedure, createTRPCRouter, editoreProcedure, publicProcedure } from "~/server/api/trpc";
import Fuse from "fuse.js";

export const editorGeneralRouter = createTRPCRouter({

  listCategory: editoreProcedure
  .query(async({ctx})=>{
    try {
     
      const categories = await ctx.db.category.findMany({
        where: {
          children: {
            none: {},
          },
        },
      });
      if (!categories || categories.length === 0) {
        throw new Error("Kategoriler bulunamadı");
      }
      
      return categories

    
    } catch (error) {
      if (error instanceof Error) {
        throw new Error("Categoryleri getirerken xeta bas verdi: " + error.message);
      } else {
        throw new Error("Categoryleri getirerken bilinmeyen bir xeta bas verdi");
      }
    }
  }),

    listTags:editoreProcedure
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