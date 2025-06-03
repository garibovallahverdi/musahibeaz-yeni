/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
    eslint: {
        ignoreDuringBuilds: true,
      },

    rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
  },

    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'qptyvfmlusdnrrofcqkx.supabase.co',
          pathname: '/**',
        },
      ],
    },
};

export default config;
