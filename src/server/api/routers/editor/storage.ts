// src/server/api/routers/storage.ts
import { z } from "zod";
import { createTRPCRouter, editoreProcedure, publicProcedure } from "~/server/api/trpc"; // Adjust path as needed
import { createSupabaseServiceRoleClient } from "~/server/supabase"; // Adjust path as needed
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from 'uuid';
const SUPABASE_STORAGE_URL = "https://qptyvfmlusdnrrofcqkx.supabase.co/storage/v1/object/public";
const SUPABASE_BUCKET_NAME = "musahibe"; // Adjust as needed
export const storageRouter = createTRPCRouter({
  uploadFile: editoreProcedure // Consider adding .middleware(isAdmin) or .middleware(isEditor) for auth
    .input(
      z.object({
        base64File: z.string(), // Base64 encoded string of the file
        fileName: z.string().optional(), // Original file name (for extension/alt text)
        fileType: z.string(), // Mime type (e.g., "image/jpeg")
        folder: z.string().optional().default("articles"), // Folder in the bucket
      })
    )
    .mutation(async ({ input }) => {
      const supabase = createSupabaseServiceRoleClient();
      const bucketName = SUPABASE_BUCKET_NAME;
      const storageUrl = SUPABASE_STORAGE_URL;

      if (!bucketName || !storageUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase storage environment variables not configured.",
        });
      }

      const { base64File, fileName, fileType, folder } = input;

      console.log("base64File:", base64File);   
      // Extract raw base64 string (remove data:image/png;base64, prefix)
      const base64Data = base64File.replace(/^data:[a-z]+\/[a-z]+;base64,/, "");
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const fileExtension = fileName ? fileName.split('.').pop() : fileType.split('/').pop();
      const newFileName = `${folder}/${uuidv4()}.${fileExtension}`;

      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(newFileName, fileBuffer, {
          contentType: fileType,
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        console.error("Supabase upload error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to upload file: ${error.message}`,
        });
      }

      const publicUrl = `${storageUrl}/${bucketName}/${newFileName}`;
      return { url: publicUrl };
    }),

  deleteFile: editoreProcedure // Consider adding .middleware(isAdmin) or .middleware(isEditor) for auth
    .input(z.object({ fileUrl: z.string().url() }))
    .mutation(async ({ input }) => {
      const supabase = createSupabaseServiceRoleClient();
      const bucketName = SUPABASE_BUCKET_NAME;
      const storageUrl = SUPABASE_STORAGE_URL;

      if (!bucketName || !storageUrl) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase storage environment variables not configured.",
        });
      }

      const { fileUrl } = input;

      const baseUrl = `${storageUrl}/${bucketName}/`;
      if (!fileUrl.startsWith(baseUrl)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid Supabase Storage URL.",
        });
      }

      const filePath = fileUrl.substring(baseUrl.length);

      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        console.error("Supabase delete error:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to delete file: ${error.message}`,
        });
      }

      return { message: "File deleted successfully." };
    }),
});