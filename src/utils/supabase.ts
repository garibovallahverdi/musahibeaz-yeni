import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qptyvfmlusdnrrofcqkx.supabase.co/storage/v1/object";
const supabaseKey = "7d5ac04ea5380aeb2442b85295ea2559";
const BUCKET = "musahibe";

export const supabase = createClient(supabaseUrl, supabaseKey);


export const uploadFile = async (file: File | Blob, filePath: string) => {
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      upsert: true, // varsa üzerine yazar
    });

  if (error) throw new Error(`Upload error: ${error.message}`);

  const { data: publicUrlData } = supabase
    .storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
};


export const deleteFile = async (filePath: string) => {
  const { error } = await supabase.storage
    .from(BUCKET)
    .remove([filePath]);

  if (error) throw new Error(`Delete error: ${error.message}`);
};