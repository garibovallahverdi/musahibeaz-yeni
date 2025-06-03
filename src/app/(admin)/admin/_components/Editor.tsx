/* eslint-disable @typescript-eslint/no-unsafe-assignment */
"use client";
import React, {  useEffect, useMemo,useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "~/trpc/react"; // tRPC hook
import { storage, uploadBytes, getDownloadURL, ref } from "~/utils/firebase"; 
import { v4 as uuidv4 } from "uuid"; // Benzersiz ID için
import ReactQuill from 'react-quill-new';


import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import Loading from "./loading";
import { CiBookmarkRemove } from "react-icons/ci";
// import { uploadFile } from "~/utils/supabase";

const Editor = () => {
  const [title, setTitle] = useState(""); 
  const [content, setContent] = useState(""); 
  const [selectedCategory, setSelectedCategory] = useState("");
  const [description, setDescription] = useState(""); 
  const [tag,setTag] = useState("")
  const [selectedTags, setSelectedtags] = useState<string[]>([])
  const router = useRouter();
  const params = useParams()
  const path = usePathname().split("/")[3]
  const slug = params.slug as string;

  const quillRef = useRef(null);
  const [pictures, setPictures] = useState<string[]>([])
  const [oldContent,setOldContent]=useState("")
  const [loading, setLoading] =useState(false)
  const [isMounted, setIsMounted] = useState(false);

  const { data:updatedata, isLoading:updateLoading, isError:updateError , refetch:updateFetch} = api.editor.article.getById.useQuery({slug});


       const { data:tagData, isLoading, isError , refetch} = api.editor.general.listTags.useQuery({search:tag});


       const { data:categoryData, isLoading:categoryLoading, isError:categoryErr,} = api.editor.general.listCategory.useQuery();

  useEffect(() => {
    setIsMounted(true);
  }, []);


  useEffect(() => {
    setIsMounted(true);
    if (slug && updatedata) {
      setTitle(updatedata.title);
      setContent(updatedata.content);
      setDescription(updatedata.description);
      setSelectedCategory(updatedata.category);
      setSelectedtags(updatedata.tags.map(t => t.name));

      // Mevcut resim URL'lerini ayıklama
      const parser = new DOMParser();
      const doc = parser.parseFromString(updatedata.content, "text/html");
      const images = doc.querySelectorAll("img");
      const existingImageUrls: string[] = [];
      images.forEach(img => {
        if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
          existingImageUrls.push(img.src);
        }
      });
      setPictures(existingImageUrls); // Mevcut resimleri state'e kaydet
    }
  }, [slug, updatedata]);

  const onChangeTagUnput = (e: React.ChangeEvent<HTMLInputElement>)=>{
    void refetch()
    setTag(e.target.value)
  }

  const addTagToArticle = (tag:string)=>{
    
    if(!selectedTags.includes(tag)){

      setSelectedtags((prev) => [...prev, tag])
      setTag("")
    }
  }
  const handleChangeCategory = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value;
    setSelectedCategory(value);
  };
  const mutation = api.editor.article.create.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
    onSuccess: () => {
      toast.success("Article created successfully");
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
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
    const editor = (quillRef.current as any)?.getEditor();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const range = editor.getSelection();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
    const uniqueId = uuidv4();

    // Resmi <img> etiketi olarak ekle ve alt özelliğini ata
    const imageHtml = `<img src="${typeof imageUrl === 'string' ? imageUrl : ''}" loading="lazy" alt="${name+"-"+uniqueId}" />`;
    // setPictures(prev=>[...prev,name+"-"+uniqueId])
  
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    editor.clipboard.dangerouslyPasteHTML(range.index, imageHtml);
  };
  

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: ["Arial", "Times New Roman", "Courier New"] }],
          [{ size: ["small", "normal", "large", "huge"] }],
          ["bold", "italic"],
          [{ color: [] }, { background: [] }],
          [{ script: "sub" }, { script: "super" }],
          [{ list: "ordered" }],
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
        matchVisual: false, // Kopyalanan mətnin formatını sıfırla
      },
    }),
    []
  );
  


  const formats = [
    "header",
    "font",
    "size",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "indent",
    "link",
    "image",
    "video",
    "color",
    "background",
    "align",
    "script",
    "code-block",
  ];


  // const handleImageUpload = async (file: File) => {
   
  //   //  const uploadUrl = await uploadFileToS3(file);
  //   uploadFile(file, `/${uuidv4()}.${file.type.split('/')[1]}`)
  //   .then((url) => {
  //     console.log("File uploaded successfully:", url);
  //     return url; // S3'ə yükləndikdən sonra URL-i qaytar
  //   })
  //   .catch((error) => {
  //     console.error("Error uploading file to S3:", error);
  //     throw error;
  //   });
  // };




const uploadImageMutation = api.editor.storage.uploadFile.useMutation();
const deleteImageMutation = api.editor.storage.deleteFile.useMutation();



const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!title || !content || !description || !selectedCategory) {
    toast.error("Bütün argumentləri doldurun !");
    return; // No need for `return null` in a void async function
  }
  setLoading(true);
  setOldContent(content); // Save current content to revert if error occurs

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");
    const images = doc.querySelectorAll("img");

    // This array will hold info about images that need to be uploaded.
    const imagesToUpload: { oldSrc: string; newUrlPromise: Promise<string> }[] = [];
    // This array will hold ALL final image URLs in the content (both existing and new).
    const finalImageURLs: string[] = [];

    for (const img of images) {
      if (img.src.startsWith("data:image")) {
        // This is a new base64 image, prepare it for upload via tRPC.
        const fileName = img.alt || `image-${Date.now()}`; // Use alt text or a timestamp
        const fileType = img.src.substring("data:".length, img.src.indexOf(";base64,")); // Extract mime type

        // Store the original base64 src and a promise for its new URL.
        // We use mutateAsync to get the promise directly.
        imagesToUpload.push({
          oldSrc: img.src,
          newUrlPromise: uploadImageMutation.mutateAsync({
            base64File: img.src,
            fileName: fileName,
            fileType: fileType,
            folder: 'articles', // Specify your target folder
          }).then(result => result.url) // Extract the URL from the mutation result
        });
      } else if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
        // This is an image already hosted on Supabase; just add its URL to the final list.
        finalImageURLs.push(img.src);
      }
    }

    // Wait for all new images to be uploaded in parallel.
    // `newImageResults` will be an array of the new Supabase URLs in the same order as `imagesToUpload`.
    const newImageResults = await Promise.all(imagesToUpload.map(item => item.newUrlPromise));

    let updatedContent = content; // Start with the original `content` string.

    // Replace the base64 src values in `updatedContent` with their new Supabase URLs.
    imagesToUpload.forEach((item, index) => {
      const newSupabaseUrl = newImageResults[index];
      if (newSupabaseUrl) {
        // Use `replace` to update the string. If there are multiple occurrences of the same base64,
        // consider a more robust replacement (e.g., regex with `g` flag if base64 can truly repeat
        // or ensure `quillRef` updates its content before this step for an exact match).
        // For typical usage where base64 images are unique, simple replace is fine.
        updatedContent = updatedContent.replace(item.oldSrc, newSupabaseUrl);
        finalImageURLs.push(newSupabaseUrl); // Add the new URL to the final list.
      }
    });

    // --- Image Deletion Logic (for article updates) ---
    // This runs only if you are editing an existing article (i.e., `slug` is present).
    if (slug) {
      // Find images that were in the article previously but are no longer in the updated content.
      const imagesToDelete = pictures.filter(url => !finalImageURLs.includes(url));
      for (const url of imagesToDelete) {
        try {
          await deleteImageMutation.mutateAsync({ fileUrl: url });
          toast.success(`Resim başarıyla silindi: ${url.substring(url.lastIndexOf('/') + 1)}`);
        } catch (deleteError) {
          console.error(`Resim silinirken hata oluştu: ${url}`, deleteError);
          toast.error(`Resim silinirken hata oluştu: ${url.substring(url.lastIndexOf('/') + 1)}`);
          // Decide if you want to stop the process here or continue despite a deletion error.
        }
      }
    }
    // --- End of Image Deletion Logic ---

    // Update the `pictures` state with the list of all images now present in the article.
    setPictures(finalImageURLs);

    // Call your main article mutation with the updated content and image URLs.
   
    await mutation.mutateAsync({
      title,
      content: updatedContent, // This now contains Supabase URLs
      category: selectedCategory,
      imagesUrl: finalImageURLs, // This list contains all final Supabase URLs
      description,
      tags: selectedTags
    });

    toast.success("Məqalə uğurla yaradıldı/güncəlləndi!"); // More informative toast
    router.push("/admin/");
    setLoading(false);

  } catch (error) {
    console.error("Məqalə yaradılarkən xəta baş verdi:", error);
    toast.error("Məqalə yaradılarkən bir xəta baş verdi");
    setLoading(false);
    setContent(oldContent); // Revert content to old state if an error occurs
  }
};
  

  



  return (
    <div className=" px-4 py-8  ">
      {/* {images && <Image src={images} alt="" width={100} height={100} />} */}

      {
        loading && <Loading/>
      }

      <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex flex-col gap-1">
      <label htmlFor="title" className="text-titleText">Başlıq</label>

      <input
          name="title"
          type="text"
          placeholder="Başlıq"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className=" px-2 input-bordered w-full"
        />
     </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-titleText">Açıqlama</label>
        <textarea
          name="description"
          placeholder="Açıqlama"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className=" px-2 pt-5 input-bordered w-full"
        />
        </div>

        <div className="flex flex-col gap-1 relative">
          {
            selectedTags && <ul className="flex">
              {
                selectedTags.map(tag=>(
                  <li key={tag} className="px-2 py-1 flex gap-2 items-center bg-gray-100 rounded-md  mr-2 mb-2">
                      <span className='flex gap-2'>
                       #{tag}
                       </span> 
                       <div className='group relative'>
               
                       <CiBookmarkRemove   className='text-lg cursor-pointer text-danger'/>
                       <span className="absolute -top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-gray-800 text-white text-xs px-3 py-1 rounded-md shadow-md transition-opacity duration-200">
                         Sil
                       </span>
                       </div>
               
                     </li>
             ))
              }
            </ul>
          }
          
      <label htmlFor="title" className="text-titleText">Tag</label>

      <input
          name="tag"
          type="text"
          
          placeholder="Tag"
          value={tag}
          onChange={(e)=>onChangeTagUnput(e)}
          className=" px-2 input-bordered w-full"
        />
       {
        tag &&  <div className="absolute w-full top-[110%]  bg-card_bg z-50 ">
         {
           tagData &&(
             <ul className="flex flex-col gap-2">
               {
               tagData.map(tag=>(
                <li onClick={()=>addTagToArticle(tag.name)} key={tag.id} className=" px-2 py-1 text-contentText cursor-pointer hover:bg-hoverTag ">{tag.name}</li>
               ))
                }
            </ul>
           )
         }
       </div>
       }
     </div>
        {
          isMounted ?<ReactQuill
          ref={quillRef}
          value={content} 
          onChange={setContent}
          modules={modules}
          formats={formats}
          theme="snow"
          className="text-contentText bg-white"
        />:"Loading"
           }
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
        { categoryData?.map((category) => (
          <option key={category?.id} value={category?.urlName}>
            {category?.name}
          </option>
        ))}
      </select>
    </div>
        <button type="submit" className="text-titleText bg-card_bg rounded-lg px-4 py-2">
          Makale Oluştur
        </button>
      </form>
    </div>
  );
};

export default Editor
