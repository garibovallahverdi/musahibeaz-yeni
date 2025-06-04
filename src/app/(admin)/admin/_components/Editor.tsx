/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "~/trpc/react"; // tRPC hook
// import { storage, uploadBytes, getDownloadURL, ref } from "~/utils/firebase"; // Firebase not used in handleSubmit
import { v4 as uuidv4 } from "uuid"; // Benzersiz ID için
import ReactQuill from 'react-quill-new';

import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import Loading from "./loading";
import { CiBookmarkRemove } from "react-icons/ci";
import { logger } from "better-auth";
// import { uploadFile } from "~/utils/supabase"; // Supabase tRPC mutations are used

const Editor = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [selectedTags, setSelectedtags] = useState<string[]>([]);
  const router = useRouter();
  const params = useParams();
  const path = usePathname().split("/")[3];
  const slug = params.slug as string;

  const quillRef = useRef(null);
  const [pictures, setPictures] = useState<string[]>([]); // Holds URLs of images initially in the article (for updates)
  const [oldContent, setOldContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { data: updatedata, isLoading: updateLoading, isError: updateError, refetch: updateFetch } = api.editor.article.getById.useQuery({ slug }, { enabled: !!slug });

  const { data: tagData, isLoading: tagIsLoading, isError: tagIsError, refetch: refetchTags } = api.editor.general.listTags.useQuery({ search: tag });

  const { data: categoryData, isLoading: categoryLoading, isError: categoryErr } = api.editor.general.listCategory.useQuery();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (slug && updatedata) {
      setTitle(updatedata.title);
      setContent(updatedata.content);
      setOldContent(updatedata.content); // Initialize oldContent for revert functionality on update
      setDescription(updatedata.description);
      setSelectedCategory(updatedata.category); // Assuming category is stored by its 'urlName' or similar identifier
      setSelectedtags(updatedata.tags.map(t => t.name));

      const parser = new DOMParser();
      const doc = parser.parseFromString(updatedata.content, "text/html");
      const images = doc.querySelectorAll("img");
      const existingImageUrls: string[] = [];
      images.forEach(img => {
        if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
          existingImageUrls.push(img.src);
        }
      });
      setPictures(existingImageUrls);
    } else {
      // Reset form for new article if slug is not present or updatedata is not available
      setTitle("");
      setContent("");
      setOldContent("");
      setDescription("");
      setSelectedCategory("");
      setSelectedtags([]);
      setPictures([]);
    }
  }, [slug, updatedata]);

  const onChangeTagUnput = (e: React.ChangeEvent<HTMLInputElement>) => {
    void refetchTags();
    setTag(e.target.value);
  };

  const addTagToArticle = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedtags((prev) => [...prev, tagName]);
      setTag("");
    }
  };

  const removeTagFromArticle = (tagName: string) => {
    setSelectedtags((prev) => prev.filter(t => t !== tagName));
  };

  const handleChangeCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCategory(value);
  };

  const createArticleMutation = api.editor.article.create.useMutation({
    onError: (error) => {
      toast.error(`Məqalə yaradılarkən xəta: ${error.message}`);
      setLoading(false);
    },
    onSuccess: () => {
      toast.success("Məqalə uğurla yaradıldı!");
      router.push("/admin/");
      setLoading(false);
    },
  });

  // New mutation for updating articles
  const updateArticleMutation = api.editor.article.update.useMutation({
    // Assuming your tRPC router has `editor.article.update`
    onError: (error) => {
      toast.error(`Məqalə güncəllənərkən xəta: ${error.message}`);
      setLoading(false);
    },
    onSuccess: () => {
      toast.success("Məqalə uğurla güncəlləndi!");
      void updateFetch(); // Refetch the article data
      router.push("/admin/"); // Or redirect to the article page: /article/${slug}
      setLoading(false);
    },
  });


  const selectCustomImage = async () => {
    if (typeof document !== "undefined") {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        if (!input.files) return;
        const file = input.files[0];

        if (file) {
          const reader = new FileReader();
          reader.readAsDataURL(file);

          reader.onload = () => {
            const base64Image = reader.result;
            insertImageToEditor({ imageUrl: base64Image, name: file.name });
          };
        }
      };
    }
  };

  const insertImageToEditor = ({ imageUrl, name }: { imageUrl: string | ArrayBuffer | null; name: string }) => {
    if (!quillRef.current) return;
    const editor = (quillRef.current as any)?.getEditor();
    const range = editor.getSelection(true); // true for focus
    const uniqueId = uuidv4();
    const imageHtml = `<img src="${typeof imageUrl === 'string' ? imageUrl : ''}" loading="lazy" alt="${name}-${uniqueId}" />`;
    editor.clipboard.dangerouslyPasteHTML(range.index, imageHtml, 'user');
  };

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }], // Keep default fonts or specify like ["Arial", "Times New Roman"]
          [{ size: ["small", "normal", "large", "huge"] }],
          ["bold", "italic", "underline", "strike"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
          [{ align: [] }],
          ["link", "image", "video"],
          ["blockquote", "code-block"],
          ["clean"],
        ],
        handlers: {
          image: selectCustomImage,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = [
    "header", "font", "size", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link", "image", "video", "color", "background",
    "align", "script", "code-block",
  ];

  const uploadImageMutation = api.editor.storage.uploadFile.useMutation();
  const deleteImageMutation = api.editor.storage.deleteFile.useMutation();

  console.log(pictures, "Pictures state in Editor component");
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !description || !selectedCategory) {
      toast.error("Bütün argumentləri doldurun !");
      return;
    }
    setLoading(true);
    // oldContent is set when data loads for an update, or on first content change for new.
    // If a new article submission fails, content remains as is. If an update fails, it reverts.
    // For consistency, perhaps setOldContent(content) here for new articles too, if needed.

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const images = doc.querySelectorAll("img");

      const imagesToUpload: { oldSrc: string; newUrlPromise: Promise<string>; alt: string }[] = [];
      const finalImageURLs: string[] = [];

      for (const img of images) {
        if (img.src.startsWith("data:image")) {
          const fileName = img.alt || `image-${Date.now()}`;
          const fileType = img.src.substring("data:".length, img.src.indexOf(";base64,"));
          imagesToUpload.push({
            oldSrc: img.src,
            alt: img.alt, // Preserve alt text
            newUrlPromise: uploadImageMutation.mutateAsync({
              base64File: img.src,
              fileName: fileName,
              fileType: fileType,
              folder: 'articles',
            }).then(result => result.url),
          });
        } else if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
          finalImageURLs.push(img.src);
        }
      }

      const newImageResults = await Promise.all(imagesToUpload.map(item => item.newUrlPromise));
      let updatedContent = content;

      imagesToUpload.forEach((item, index) => {
        const newSupabaseUrl = newImageResults[index];
        if (newSupabaseUrl) {
          // Ensure replacement is robust: create a temporary unique placeholder if needed,
          // or replace based on more specific attributes if simple src replacement isn't safe.
          // For now, a direct replacement is used.
          // To make it safer, one could replace the img tag having specific item.oldSrc and item.alt
          updatedContent = updatedContent.replace(item.oldSrc, newSupabaseUrl);
          finalImageURLs.push(newSupabaseUrl);
        }
      });
      
      // --- Image Deletion Logic (for article updates) ---
      if (slug && updatedata) { // Ensure it's an update context
        // `pictures` state holds the initial image URLs from when the article was loaded
        const imagesToDelete = pictures.filter(url => !finalImageURLs.includes(url));
        for (const url of imagesToDelete) {
          try {
            await deleteImageMutation.mutateAsync({ fileUrl: url });
            toast.info(`Köhnə şəkil silindi: ${url.substring(url.lastIndexOf('/') + 1)}`);
          } catch (deleteError: any) {
            console.error(`Resim silinirken hata oluştu: ${url}`, deleteError);
            toast.error(`Resim silinirken hata oluştu: ${url.substring(url.lastIndexOf('/') + 1)} - ${deleteError.message}`);
            // Decide if you want to stop the process here or continue. For now, it continues.
          }
        }
      }
      // --- End of Image Deletion Logic ---

      setPictures(finalImageURLs); // Update `pictures` state for future edits if user stays on page

      if (slug && updatedata) { // If slug and updatedata exist, it's an update
        await updateArticleMutation.mutateAsync({
          id: updatedata.id, // Pass the ID of the article to update
          title,
          content: updatedContent,
          category: selectedCategory,
          imagesUrl: finalImageURLs,
          description,
          tags: selectedTags,
        });
      } else { // No slug, it's a new article
        await createArticleMutation.mutateAsync({
          title,
          content: updatedContent,
          category: selectedCategory,
          imagesUrl: finalImageURLs,
          description,
          tags: selectedTags,
        });
      }
      // setLoading and router.push are handled by mutation's onSuccess/onError

    } catch (error: any) {
      console.error("Məqalə yaradılarkən/güncəllənərkən xəta baş verdi:", error);
      toast.error(`Əməliyyat zamanı xəta: ${error.message || "Bilinməyən xəta"}`);
      setLoading(false);
      // Revert content if an error occurs outside of mutations (e.g., image processing)
      // For mutation errors, their own onError handles setLoading.
      // Consider if reverting content is always desired or only for specific errors.
      setContent(oldContent);
    }
  };

  if (!isMounted || (slug && updateLoading)) {
    return <Loading />; // Show loading while checking for existing article or if component hasn't mounted
  }
  if (slug && updateError) {
      return <div className="text-red-500 p-4">Məqalə məlumatları yüklənərkən xəta baş verdi.</div>
  }



  return (
    <div className="px-4 py-8">
      {loading && <Loading />}
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-titleText">Başlıq</label>
          <input
            name="title"
            type="text"
            placeholder="Başlıq"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-2 py-2 input input-bordered w-full" // Added py-2 for better input height
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-titleText">Açıqlama</label>
          <textarea
            name="description"
            placeholder="Açıqlama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-2 pt-2 pb-2 input input-bordered w-full min-h-[80px]" // Added pb-2, min-h
          />
        </div>

        <div className="flex flex-col gap-1 relative">
          {selectedTags.length > 0 && (
            <ul className="flex flex-wrap mb-2"> {/* Added flex-wrap */}
              {selectedTags.map(tagItem => (
                <li key={tagItem} className="px-2 py-1 flex gap-2 items-center bg-gray-100 rounded-md mr-2 mb-2">
                  <span className='flex gap-1 items-center'> {/* Reduced gap */}
                    #{tagItem}
                  </span>
                  <div className='group relative'>
                    <CiBookmarkRemove onClick={() => removeTagFromArticle(tagItem)} className='text-lg cursor-pointer text-red-500 hover:text-red-700'/>
                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-700 text-white text-xs px-2 py-1 rounded-md shadow-md transition-opacity duration-200 pointer-events-none">
                      Sil
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <label htmlFor="tag" className="text-titleText">Tag</label>
          <input
            name="tag"
            type="text"
            placeholder="Tag əlavə et"
            value={tag}
            onChange={onChangeTagUnput}
            className="px-2 py-2 input input-bordered w-full"
          />
          {tag && tagData && tagData.length > 0 && (
            <div className="absolute w-full top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
              <ul className="flex flex-col">
                {tagData.filter(t => !selectedTags.includes(t.name)).map(tagItem => ( // Filter out already selected tags
                  <li onClick={() => addTagToArticle(tagItem.name)} key={tagItem.id} className="px-3 py-2 text-contentText cursor-pointer hover:bg-gray-100">
                    {tagItem.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {isMounted ? (
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={(newContent) => {
                if(oldContent==="") setOldContent(content) // Set old content on first change if it's a new article
                setContent(newContent)
            }}
            modules={modules}
            formats={formats}
            theme="snow"
            className="text-contentText bg-white min-h-[300px] prose max-w-none" // Added min-h and prose for better styling
          />
        ) : (
          <div className="min-h-[300px] flex items-center justify-center border rounded-md">Yüklənir...</div>
        )}

        <div className="w-full max-w-sm">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kateqoriya seçin
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleChangeCategory}
            className="mt-1 block w-full p-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="" disabled>
              Seçin...
            </option>
            {categoryData?.map((category) => (
              <option key={category?.id} value={category?.urlName}> {/* Assuming urlName is the identifier */}
                {category?.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading || (!!slug && updateLoading)} className="text-white bg-blue-600 hover:bg-blue-700 rounded-lg px-5 py-2.5 text-center font-medium disabled:opacity-50">
          {slug ? "Məqaləni Güncəllə" : "Məqalə Yarat"}
        </button>
      </form>
    </div>
  );
};

export default Editor;