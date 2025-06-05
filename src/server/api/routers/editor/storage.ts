// src/server/api/routers/storage.ts
import { z } from "zod";
import { createTRPCRouter, editoreProcedure, publicProcedure } from "~/server/api/trpc"; // Adjust path as needed
import { createSupabaseServiceRoleClient } from "~/server/supabase"; // Adjust path as needed
import { TRPCError } from "@trpc/server";
import { v4 as uuidv4 } from 'uuid';
const SUPABASE_STORAGE_URL = "https://qptyvfmlusdnrrofcqkx.supabase.co/storage/v1/object/public";
const SUPABASE_BUCKET_NAME = "musahibe"; // Adjust as needed
export const storageRouter = createTRPCRouter({
 uploadFile: editoreProcedure
    .input(
      z.object({
        base64File: z.string(),
        fileName: z.string().optional(),
        fileType: z.string(),
        folder: z.string().optional().default("articles"),
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

      const base64Data = base64File.replace(/^data:[a-z]+\/[a-z]+;base64,/, "");
      const fileBuffer = Buffer.from(base64Data, 'base64');

      const fileExtension = fileName ? fileName.split('.').pop() : fileType.split('/').pop();
      const newFileName = `${folder}/${uuidv4()}.${fileExtension}`; // Dosya adını benzersiz yapın

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


    deleteFile2: editoreProcedure
    .input(z.object({ fileUrl: z.string().url("Geçerli bir URL girin.") })) // Sileceğimiz görselin URL'si
    .mutation(async ({ input }) => {
      const supabase = createSupabaseServiceRoleClient();
      const bucketName = SUPABASE_BUCKET_NAME; // Ortam değişkeninizden Supabase Bucket adını alın

      if (!bucketName) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Supabase bucket adı ortam değişkeni yapılandırılmamış.",
        });
      }

      const { fileUrl } = input;

      // URL'den dosya yolunu çıkarın
      // Örnek URL yapısı: https://[your-project-ref].supabase.co/storage/v1/object/public/[your-bucket-name]/[folder]/[file_name.jpg]
      // Bu nedenle, bucket adından sonraki kısmı almamız gerekiyor.
      const urlParts = fileUrl.split(`/${bucketName}/`);
      if (urlParts.length < 2) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Geçersiz dosya URL'si formatı. URL bucket adını içermiyor olabilir.",
        });
      }
      const filePath = urlParts[1]; // Bucket adından sonraki kısım bizim dosya yolumuz

      if (!filePath) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Dosya yolu URL'den çıkarılamadı.",
        });
      }

      try {
        const { error } = await supabase.storage
          .from(bucketName)
          .remove([filePath]); // remove metodu bir dizi string alır

        if (error) {
          console.error("Supabase delete error:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: `Dosya silinirken hata oluştu: ${error.message}`,
          });
        }
        return { success: true, message: "Dosya başarıyla silindi." };
      } catch (error) {
        console.error("Supabase delete operation failed:", error);
        if (error instanceof TRPCError) {
            throw error; // Zaten bir TRPCError ise direkt fırlat
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Görsel silme işleminde beklenmeyen bir hata oluştu: ${(error as Error).message}`,
        });
      }
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