import { z } from "zod";

import { adminProcedure, createTRPCRouter, publicProcedure } from "~/server/api/trpc";

export const adminUserRouter = createTRPCRouter({

    getUsers: adminProcedure
     .input(z.object({
          page: z.number().min(1), 
          limit: z.number().min(1).max(50)
        }))
    .query(async ({ ctx , input})=> {
        const { page, limit } = input;

        const skip = (page - 1) * limit;
        try {
            const users = await ctx.db.user.findMany({
                where:{ NOT:{id:ctx.auth.user.id}},
                skip,
                take: limit,
            });
            const count = await ctx.db.user.count();
            if (!users) {
                throw new Error("User tapilmadi");
            }

            return { users, count };
        }

        catch (error) {
            if (error instanceof Error) {
                throw new Error("User getirilirken xeta oludu: " + error.message);
            } else {
                throw new Error("User getirilirken bilinmeyen bir xeta oldu");
            }
        }
        }),


        accepUser: adminProcedure
        .input(z.object({
            id: z.string()
        }))
        .mutation(async ({ ctx, input }) => {
            const { id } = input;
            try {
                const user = await ctx.db.user.update({
                    where: { id,  emailVerified: true },
                    data: { adminAccept: true },
                });
                return user;
            } catch (error) {
                if (error instanceof Error) {
                    throw new Error("User qebul edilende xeta bas verdi: " + error.message);
                } else {
                    throw new Error("User qebul edilende bilinmeyen bir xeta bas verdi");
                }
            }

        }),

    setUserRole: adminProcedure
    .input(
      z.object({
        id: z.string(),
        role: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
        console.log("User rolü değiştiriliyor:", input.role, input.id); 
      const { id, role } = input;
      
      try {
        const user = await ctx.db.user.update({
          where: { id, adminAccept: true },
          data: { role: role },
        });
        return user;
      } catch (error) {
        if (error instanceof Error) {
          throw new Error("User rolü değiştirirken hata oluştu: " + error.message);
        } else {
          throw new Error("User rolü değiştirirken bilinmeyen bir hata oluştu");
        }
      }
    }),

})