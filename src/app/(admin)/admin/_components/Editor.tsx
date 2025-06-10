"use client";

import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

import { api } from "~/trpc/react";
import Loading from "./loading";
import { CiBookmarkRemove, CiImageOn } from "react-icons/ci";
import { MdDeleteForever } from "react-icons/md";
import Image from "next/image";

// Makale verileri için tip tanımı
interface ArticleData {
  title: string;
  content: string;
  description: string;
  category: string;
  tags: string[];
  galleryImages: string[];
  multimedia: boolean;
}

const Editor = () => {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string; // Makale düzenleme modunda slug

  // --- State Yönetimi ---
  const [title, setTitle] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [tagInput, setTagInput] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isMultimedia, setIsMultimedia] = useState<boolean>(false);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  // Düzenleme sırasında silinmek üzere işaretlenen galeri görselleri
  const [galleryImagesToDelete, setGalleryImagesToDelete] = useState<string[]>([]);

  // Yükleme durumları ve bileşen montajı için state'ler
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isGalleryLoading, setIsGalleryLoading] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // ReactQuill editörü için referans
  const quillRef = useRef<ReactQuill>(null);

  // --- tRPC Sorguları ve Mutasyonları ---
  const {
    data: articleToEdit,
    isLoading: isArticleLoading,
    isError: articleFetchError,
  } = api.editor.article.getById.useQuery({ slug }, { enabled: !!slug }); // Slug varsa makaleyi getir

  const { data: tagSuggestions, refetch: refetchTagSuggestions } =
    api.editor.general.listTags.useQuery({ search: tagInput }, { enabled: !!tagInput }); // Tag önerilerini getir

  const { data: categories, isLoading: isCategoriesLoading } =
    api.editor.general.listCategory.useQuery(); // Kategorileri getir

  const createArticleMutation = api.editor.article.create.useMutation();
  const updateArticleMutation = api.editor.article.update.useMutation();
  const uploadFileMutation = api.editor.storage.uploadFile.useMutation();
  const deleteFileMutation = api.editor.storage.deleteFile.useMutation();

  // Bileşen mount edildiğinde isMounted state'ini ayarla
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Makale düzenleme veya yeni makale oluşturma durumlarına göre formu doldur/sıfırla
  useEffect(() => {
    if (slug && articleToEdit) {
      // Düzenleme modu: mevcut makale verilerini doldur
      setTitle(articleToEdit.title);
      setContent(articleToEdit.content);
      setDescription(articleToEdit.description);
      setSelectedCategory(articleToEdit.category);
      setSelectedTags(articleToEdit.tags.map((t) => t.name));
      // Mevcut galeri görsellerini kopyalayarak state'e ata
      setGalleryImages([...(articleToEdit.galleryImages || [])]);
      setIsMultimedia(articleToEdit.multimedia || false);
      setGalleryImagesToDelete([]); // Düzenleme başladığında silinecek resimler listesini sıfırla
    } else if (!slug) {
      // Yeni makale oluşturma modu: formu sıfırla
      setTitle("");
      setContent("");
      setDescription("");
      setSelectedCategory("");
      setSelectedTags([]);
      setGalleryImages([]);
      setIsMultimedia(false);
      setGalleryImagesToDelete([]); // Bekleyen silme işlemlerini temizle
    }
  }, [slug,articleToEdit]);

  // --- Tag Yönetimi ---
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
    if (e.target.value.trim() !== "") {
      void refetchTagSuggestions(); // Input boş değilse tag önerilerini yeniden getir
    }
  };

  const addTag = (tagName: string) => {
    if (!selectedTags.includes(tagName)) {
      setSelectedTags((prev) => [...prev, tagName]);
      setTagInput(""); // Tag ekledikten sonra input'u temizle
    }
  };

  const removeTag = (tagName: string) => {
    setSelectedTags((prev) => prev.filter((t) => t !== tagName));
  };

  // --- Kategori Yönetimi ---
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(event.target.value);
  };

  // --- Rich Text Editör (ReactQuill) Resim Yükleme İşleyicisi ---
  const imageHandler = useCallback(() => {
    if (typeof document === "undefined") return;

    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      if (!input.files?.length) return;
      const file = input.files[0];

      if (file) {
        const reader = new FileReader();
        reader.onload = async () => {
          const base64Image = reader.result as string;
          const editor = quillRef.current?.getEditor();
          const range = editor?.getSelection(true);

          if (editor && range) {
            // Geçici bir yer tutucu resim ekle
            const tempAlt = `uploading-image-${uuidv4()}`;
            editor.clipboard.dangerouslyPasteHTML(
              range.index,
              `<img src="${base64Image}" alt="${tempAlt}" style="max-width: 100%; height: auto;" />`
            );
          }
        };
        reader.readAsDataURL(file);
      }
    };
  }, []);

  // ReactQuill modülleri ve formatları
  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ font: [] }],
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
          image: imageHandler, // Resim yükleme işleyicisini ata
        },
      },
      clipboard: {
        matchVisual: false,
      },
    }),
    [imageHandler]
  );

  const formats = [
    "header", "font", "size", "bold", "italic", "underline", "strike", "blockquote",
    "list", "bullet", "indent", "link", "image", "video", "color", "background",
    "align", "script", "code-block",
  ];

  // --- Galeri Görseli Yönetimi ---
  const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || !isMultimedia) return;

    const files = Array.from(event.target.files);
    setIsGalleryLoading(true);
    const uploadedUrls: string[] = [];

    for (const file of files) {
      try {
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          // eslint-disable-next-line @typescript-eslint/prefer-promise-reject-errors
          reader.onerror = (error) => reject(error);
        });
        reader.readAsDataURL(file);
        const base64Image = await base64Promise;

        const result = await uploadFileMutation.mutateAsync({
          base64File: base64Image,
          fileName: file.name,
          fileType: file.type,
          folder: "gallery",
        });
        uploadedUrls.push(result.url);
        toast.success(`'${file.name}' galeriye başarıyla yüklendi.`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (error: any) {
        console.error(`Galeri görseli yüklenirken hata oluştu: ${file.name}`, error);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        toast.error(`'${file.name}' yüklenemedi: ${error.message}`);
      }
    }
    // Yeni yüklenen URL'leri mevcut galeri görselleri state'ine ekle
    
    setGalleryImages((prev) => [...prev, ...uploadedUrls]);
    setIsGalleryLoading(false);
    event.target.value = ""; // Input'u temizle

    console.log(galleryImages, "galery images upload");
    
  };

  const handleDeleteGalleryImage = (imageUrl: string) => {
    if (slug && articleToEdit) {
      // Düzenleme modundaysa, silinmek üzere işaretle ancak hemen depolamadan silme
      setGalleryImagesToDelete((prev) => [...prev, imageUrl]);
      // Arayüzü güncellemek için galleryImages state'inden hemen kaldır
      setGalleryImages((prev) => prev.filter((url) => url !== imageUrl));
      toast.info("Galeri görseli makale güncellendiğinde silinmek üzere işaretlendi.");
    } else {
      // Yeni makale oluşturma modundaysa, henüz kaydedilmediği için hemen sil
      setIsLoading(true);
      deleteFileMutation.mutateAsync({ fileUrl: imageUrl })
        .then(() => {
          setGalleryImages((prev) => prev.filter((url) => url !== imageUrl));
          toast.success("Galeri görseli başarıyla silindi.");
        })
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .catch((error: any) => {
          console.error("Galeri görseli hemen silinirken hata oluştu:", error);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
          toast.error(`Galeri görseli silinirken hata oluştu: ${error.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    console.log(galleryImages, "galery images delete");

  };

  // --- Form Gönderimi ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !content || !description || !selectedCategory) {
      toast.error("Lütfen gerekli tüm alanları doldurun!");
      return;
    }

    setIsLoading(true);

    try {
      const parser = new DOMParser();
      const currentDoc = parser.parseFromString(content, "text/html");
      const imagesInContent = Array.from(currentDoc.querySelectorAll("img"));

      const existingContentImageUrls: string[] = [];
      const imagesToUploadPromises: Promise<{ oldSrc: string; newUrl: string }>[] = [];

      // İçerikteki base64 resimlerini yükle ve URL'lerini değiştir
      for (const img of imagesInContent) {
        if (img.src.startsWith("data:image")) {
          const fileName = img.alt.startsWith("uploading-image-")
            ? `article-image-${uuidv4()}`
            : img.alt || `image-${Date.now()}`;
          const fileType = img.src.substring("data:".length, img.src.indexOf(";base64,"));

          imagesToUploadPromises.push(
            uploadFileMutation.mutateAsync({
              base64File: img.src,
              fileName: fileName,
              fileType: fileType,
              folder: "articles",
            }).then(result => ({ oldSrc: img.src, newUrl: result.url }))
          );
        } else if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ?? '')) {
          // Mevcut içerik görsellerini listeye ekle
          existingContentImageUrls.push(img.src);
        }
      }

      const newUploadedContentImages = await Promise.all(imagesToUploadPromises);

      let finalContent = content;
      newUploadedContentImages.forEach(({ oldSrc, newUrl }) => {
        finalContent = finalContent.replace(oldSrc, newUrl);
        existingContentImageUrls.push(newUrl); // Yeni yüklenen resim URL'lerini listeye ekle
      });

      // Makale güncellenirken eski içerik görsellerini silme
      if (slug && articleToEdit) {
        const initialContentImages = Array.from(
          parser.parseFromString(articleToEdit.content, "text/html").querySelectorAll("img")
        ).map(img => img.src);

        const imagesToDeleteFromContent = initialContentImages.filter(
          url => url.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL ?? '') && !existingContentImageUrls.includes(url)
        );

        for (const url of imagesToDeleteFromContent) {
          try {
            await deleteFileMutation.mutateAsync({ fileUrl: url });
            toast.info(`Eski içerik görseli silindi: ${url.substring(url.lastIndexOf('/') + 1)}`);
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (deleteError: any) {
            console.error(`Eski içerik görseli silinirken hata oluştu: ${url}`, deleteError);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
            toast.error(`Eski görsel ${url.substring(url.lastIndexOf('/') + 1)} silinemedi: ${deleteError.message}`);
          }
        }
      }

      // Makale verilerini hazırla
      const articleData: ArticleData = {
        title,
        content: finalContent,
        description,
        category: selectedCategory,
        tags: selectedTags,
        // galleryImages state'i zaten silinmek üzere işaretlenenler hariç,
        // güncel görselleri içerir.
        galleryImages: isMultimedia ? galleryImages : [],
        multimedia: isMultimedia,
      };

      if (slug && articleToEdit) {
        // Mevcut makaleyi güncelle
        await updateArticleMutation.mutateAsync({ id: articleToEdit.id, ...articleData });
        toast.success("Makale başarıyla güncellendi!");

        // Makale güncellendikten sonra silinmek üzere işaretlenen galeri görsellerini sil
        for (const url of galleryImagesToDelete) {
          try {
            await deleteFileMutation.mutateAsync({ fileUrl: url });
            toast.info(`Galeri görseli silindi: ${url.substring(url.lastIndexOf('/') + 1)}`);
            // galleryImages state'i zaten handleDeleteGalleryImage tarafından güncellendiği için
            // burada tekrar güncellemeye gerek yok.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } catch (deleteError: any) {
            console.error(`Güncelleme sırasında galeri görseli silinirken hata oluştu: ${url}`, deleteError);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            toast.error(`Galeri görseli ${url.substring(url.lastIndexOf('/') + 1)} silinemedi: ${deleteError.message}`);
          }
        }
        setGalleryImagesToDelete([]); // İşlem tamamlandıktan sonra silinecekler listesini temizle
      } else {
        // Yeni makale oluştur
        await createArticleMutation.mutateAsync(articleData);
        toast.success("Makale başarıyla oluşturuldu!");
      }
      router.push("/admin"); // Başarılı olursa admin sayfasına yönlendir
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Gönderim hatası:", error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      toast.error(`İşlem başarısız oldu: ${error.message || "Bilinmeyen bir hata oluştu"}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Yükleme ve Hata Durumları ---
  if (!isMounted || (slug && isArticleLoading) || isCategoriesLoading) {
    return <Loading />; // Yükleme ekranı göster
  }

  if (slug && articleFetchError) {
    return (
      <div className="p-4 text-red-500">
        Makale verileri yüklenirken hata oluştu. Lütfen tekrar deneyin.
      </div>
    );
  }
    console.log(galleryImages, "galery images any");

  // --- Bileşen Arayüzü ---
  return (
    <div className="px-4 py-8">
      {isLoading && <Loading />}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Başlık Input'u */}
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-titleText">
            Başlık (Title)
          </label>
          <input
            name="title"
            type="text"
            placeholder="Başlık"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input input-bordered w-full px-2 py-2"
            required
          />
        </div>

        {/* Açıklama Textarea'sı */}
        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-titleText">
            Açıklama (Description)
          </label>
          <textarea
            name="description"
            placeholder="Açıklama"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input input-bordered w-full min-h-[80px] px-2 pt-2 pb-2"
            required
          />
        </div>

        {/* Multimedia Toggle */}
        <div className="flex items-center gap-2">
          <input
            id="multimedia"
            type="checkbox"
            className="checkbox"
            checked={isMultimedia}
            onChange={(e) => setIsMultimedia(e.target.checked)}
          />
          <label htmlFor="multimedia" className="text-titleText">
            Multimedia İçerik (Multimedia Content)
          </label>
        </div>

        {/* Galeri Görseli Bölümü (Multimedia açıksa gösterilir) */}
        {isMultimedia && (
          <div className="flex flex-col gap-3">
            <label className="text-titleText flex items-center gap-2">
              <CiImageOn className="text-xl" /> Galeri Görselleri (Gallery Images)
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleGalleryImageUpload}
              className="file-input file-input-bordered w-full"
              disabled={isGalleryLoading}
            />
            {isGalleryLoading && <div>Galeri görselleri yükleniyor...</div>}
            {galleryImages.length > 0 && (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 mt-4">
                {galleryImages.map((imageUrl) => (
                  <div
                    key={imageUrl}
                    className="group relative aspect-video w-full overflow-hidden rounded-lg shadow-md"
                  >
                    <Image
                      src={imageUrl}
                      alt="Galeri Görseli"
                      className="h-[80px] w-full object-cover"
                      loading="lazy"
                      width={80}
                      height={80}
                    />
                    <button
                      type="button"
                      onClick={() => handleDeleteGalleryImage(imageUrl)}
                      className="absolute right-2 top-2 rounded-full bg-red-600 p-1 text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      title="Görseli Sil"
                      disabled={isLoading}
                    >
                      <MdDeleteForever className="text-xl" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tag Bölümü */}
        <div className="relative flex flex-col gap-1">
          {selectedTags.length > 0 && (
            <ul className="mb-2 flex flex-wrap">
              {selectedTags.map((tagItem) => (
                <li
                  key={tagItem}
                  className="mb-2 mr-2 flex items-center gap-2 rounded-md bg-gray-100 px-2 py-1"
                >
                  <span className="flex items-center gap-1">#{tagItem}</span>
                  <div className="group relative">
                    <CiBookmarkRemove
                      onClick={() => removeTag(tagItem)}
                      className="cursor-pointer text-lg text-red-500 hover:text-red-700"
                    />
                    <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 rounded-md bg-gray-700 px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
                      Sil (Delete)
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <label htmlFor="tagInput" className="text-titleText">
            Tag (Tags)
          </label>
          <input
            name="tagInput"
            type="text"
            placeholder="Tag əlavə et (Add tag)"
            value={tagInput}
            onChange={handleTagInputChange}
            className="input input-bordered w-full px-2 py-2"
          />
          {tagInput && tagSuggestions && tagSuggestions.length > 0 && (
            <div className="absolute top-full z-50 mt-1 w-full max-h-60 overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg">
              <ul className="flex flex-col">
                {tagSuggestions
                  .filter((t) => !selectedTags.includes(t.name))
                  .map((tagItem) => (
                    <li
                      onClick={() => addTag(tagItem.name)}
                      key={tagItem.id}
                      className="cursor-pointer px-3 py-2 text-contentText hover:bg-gray-100"
                    >
                      {tagItem.name}
                    </li>
                  ))}
              </ul>
            </div>
          )}
        </div>

        {/* ReactQuill Editörü */}
        {isMounted ? (
          <ReactQuill
            ref={quillRef}
            value={content}
            onChange={setContent}
            modules={modules}
            formats={formats}
            theme="snow"
            className="prose min-h-[300px] max-w-none bg-white text-contentText"
          />
        ) : (
          <div className="flex min-h-[300px] items-center justify-center rounded-md border">
            Yüklənir... (Loading...)
          </div>
        )}

        {/* Kategori Seçimi */}
        <div className="w-full max-w-sm">
          <label htmlFor="category" className="block text-sm font-medium text-gray-700">
            Kateqoriya seçin (Select Category)
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={handleCategoryChange}
            className="mt-1 block w-full rounded-lg border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="" disabled>
              Seçin... (Select...)
            </option>
            {categories?.map((category) => (
              <option key={category.id} value={category.urlName}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Gönder Butonu */}
        <button
          type="submit"
          disabled={isLoading || isArticleLoading || isCategoriesLoading || isGalleryLoading}
          className="rounded-lg bg-blue-600 px-5 py-2.5 text-center font-medium text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {slug ? "Məqaləni Güncəllə (Update Article)" : "Məqalə Yarat (Create Article)"}
        </button>
      </form>
    </div>
  );
};

export default Editor;