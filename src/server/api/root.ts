import { articleRouter } from "~/server/api/routers/public/article";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { newsRouter } from "./routers/admin/news";
import { tagRouter } from "./routers/admin/tag";
import { tagPublicRouter } from "./routers/public/tag";
import { userRouter } from "./routers/user";
import { adminUserRouter } from "./routers/admin/users";
import { storageRouter } from "./routers/admin/storage";
/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  public: {
    article:articleRouter,
    tag:tagPublicRouter
  },
  admin: {
    news:newsRouter,
    tag:tagRouter,
    users:adminUserRouter,
    storage: storageRouter, 

    
  },
  user: userRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
