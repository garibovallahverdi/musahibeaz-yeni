import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const userRouter = protectedProcedure.query(({ ctx }) => {
    return ctx.auth;
})