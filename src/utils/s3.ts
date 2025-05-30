// utils/s3.ts (or a similar location)
import { S3, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import mime from 'mime-types';
import { v4 as uuidv4 } from 'uuid';
// It's generally better to load environment variables in a server-side context
// or during the build process, rather than directly in client-side code.
// For a Next.js API route or server component, process.env would be accessible.
// For a client component, you'd typically expose these via a public runtime config
// or proxy through an API route.
// For this example, I'll assume you have a secure way to access these in a production environment.

const s3Client = new S3({
  forcePathStyle: false,
  endpoint: process.env.NEXT_PUBLIC_DO_SPACES_ENDPOINT || "https://fra1.digitaloceanspaces.com",
  region: process.env.NEXT_PUBLIC_DO_SPACES_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_DO_SPACES_KEY || "DO801E69MVFUX2KCV2EH",
    secretAccessKey: process.env.NEXT_PUBLIC_DO_SPACES_SECRET || "5JEngGg05rWoJxDTwnTBfD3KeLCTHI979YUEiiop7hQ"
  },
});

const DO_SPACES_BUCKET = process.env.NEXT_PUBLIC_DO_SPACES_BUCKET || "autome";

export const uploadFileToS3 = async (file: File): Promise<string> => {
  const fileExtension = mime.extension(file.type);
  const fileName = `/musahibe/articles/${uuidv4()}.${fileExtension}`; // Unique file name in 'articles/' folder

  // Convert the File object to an ArrayBuffer
  const fileArrayBuffer = await file.arrayBuffer();
  const fileUint8Array = new Uint8Array(fileArrayBuffer);

  const params = {
    Bucket: DO_SPACES_BUCKET,
    Key: fileName,
    Body: fileUint8Array, // Use Uint8Array as the body
    ContentType: file.type,
    ACL: 'public-read' as import('@aws-sdk/client-s3').ObjectCannedACL,
  };

  try {
    await s3Client.send(new PutObjectCommand(params));
    // Construct the public URL for the file
    // Ensure DO_SPACES_ENDPOINT is correctly configured (e.g., https://fra1.digitaloceanspaces.com)
    return `<span class="math-inline">\{DO\_SPACES\_ENDPOINT\}/</span>{fileName}`;
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    throw error;
  }
};
export const deleteFileFromS3 = async (fileUrl: string) => {
  // Extract the key (path) from the URL
  const urlParts = fileUrl.split('/');
  const key = urlParts.slice(urlParts.indexOf('articles')).join('/'); // Assuming 'articles' is your base folder

  const params = {
    Bucket: DO_SPACES_BUCKET,
    Key: key,
  };

  try {
    await s3Client.send(new DeleteObjectCommand(params));
    console.log(`File ${key} deleted successfully from S3.`);
  } catch (error) {
    console.error(`Error deleting file ${key} from S3:`, error);
    throw error;
  }
};