import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import Fuse from "fuse.js";

export const tagRouter = createTRPCRouter({

    create: publicProcedure
    .input(z.object({
        tag:z.string().min(2,"Minumum 2 hərf olmalıdır")
    }))
    .mutation(async({ctx, input})=>{

        try {
                
       const exsistTag = await ctx.db.tag.findUnique({
        where:{
            name:input.tag.toLowerCase().trim(),
        }
    })
    
    

            if(exsistTag){
                throw new Error("Məlumat zatən mövcudur.")
            }

      const normalizeTagvalue = input.tag
                                .replace(/[ı]/g, "i")
                                .replace(/[ə]/g, "e")
                                .replace(/[ə]/g, "e")
                                .replace(/[ü]/g, "u")
                                .toLowerCase().trim()

            const newTag = await ctx.db.tag.create({
                data:{
                    name:input.tag.toLowerCase().trim(),
                    tagValue:normalizeTagvalue

                }
            })

            return newTag
            
        } catch (error) {
            if (error instanceof Error) {
                throw new Error("Tag yaradilarkən xəta baş verdi. " + error.message);
              } else {
                throw new Error("Tag yaradılarkən bilinməyən bir xəta baş verdi.");
              }
        }
    }),

    
    remove: publicProcedure
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

    list:publicProcedure
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