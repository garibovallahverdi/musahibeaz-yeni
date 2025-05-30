import { betterAuth } from "better-auth";
import { admin, openAPI, phoneNumber, username } from "better-auth/plugins";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { db } from "~/server/db";
import { resend } from "~/server/resend";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  plugins: [admin(), phoneNumber(), username(), openAPI()],
  trustedOrigins: ["http://localhost:3000",'https://musahibe.az'],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: process.env.NODE_ENV === "production",

    // process.env.NODE_ENV === "production",

    
  
},

  emailVerification: {
    autoSignInAfterVerification: true,
    
    async sendVerificationEmail({ user, url, token }, request) {
      const { data: resendData, error } = await resend.emails.send({
        from: "support@musahibe.az",
        to: user.email,
        subject: "Verify your email address",
        text: `Click the link to verify your email: ${url}`,
      });

      console.log(url);
      
      if (error) {
        console.error(error);
        throw error;
      }
      return;
    },
  },

  
  // secondaryStorage: {
  //   get: (key) => redis.get(key),
  //   set: (key, value, ttl) => {
  //     if (typeof ttl !== "undefined")
  //       return redis.set(key, JSON.stringify(value), { EX: ttl });
  //     return redis.set(key, JSON.stringify(value));
  //   },
  //   delete: (key) => redis.del(key).then(() => void 0),
  // },
});



export async function getServerSideAuth(headers: Headers) {
  return auth.api.getSession({
    headers,
  });
}
