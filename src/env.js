import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /* --------------------- 1) SUNUCU DEĞİŞKENLERİ --------------------- */
  server: {
    DATABASE_URL: z.string().url(),
    RESEND_API_KEY: z.string(),

    /* -- DigitalOcean Spaces -- */
   

    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  },

  /* --------------------- 2) İSTEMCİ DEĞİŞKENLERİ -------------------- */
  client: {
    NEXT_PUBLIC_TRPC_API_URL: z.string().url(),
    // // @ts-ignore
    // DO_SPACES_ENDPOINT: z.string().url(),
    // // @ts-ignore
    // DO_SPACES_REGION: z.string(),
    // // @ts-ignore
    // DO_SPACES_KEY: z.string(),
    // // @ts-ignore
    // DO_SPACES_SECRET: z.string(),
    // // @ts-ignore
    // DO_SPACES_BUCKET: z.string(),
  },

  /* --------------------- 3) RUNTIME MAPPING ------------------------- */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,

    // @ts-ignore
    // DO_SPACES_ENDPOINT: process.env.DO_SPACES_ENDPOINT,
    // DO_SPACES_REGION: process.env.DO_SPACES_REGION,
    // DO_SPACES_KEY: process.env.DO_SPACES_KEY,
    // DO_SPACES_SECRET: process.env.DO_SPACES_SECRET,
    // DO_SPACES_BUCKET: process.env.DO_SPACES_BUCKET,

    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_TRPC_API_URL: process.env.NEXT_PUBLIC_TRPC_API_URL,
  },

  /* --------------------------------------------------------------- */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
