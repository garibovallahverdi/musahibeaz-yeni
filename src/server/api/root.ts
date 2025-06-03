import { articleRouter } from "~/server/api/routers/public/article";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { tagPublicRouter } from "./routers/public/tag";
import { userRouter } from "./routers/user";
import { adminUserRouter } from "./routers/admin/users";
import { adminArticleRouter } from "./routers/admin/news";
import { adminTagRouter } from "./routers/admin/tag";
import { editorArticleRouter } from "./routers/editor/news";
import { storageRouter } from "./routers/editor/storage";
import { editorGeneralRouter } from "./routers/editor/general";
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
    article:adminArticleRouter,
    tag:adminTagRouter,
    users:adminUserRouter,
  },

  editor: {
    article:editorArticleRouter,
    storage: storageRouter,
    general: editorGeneralRouter
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
