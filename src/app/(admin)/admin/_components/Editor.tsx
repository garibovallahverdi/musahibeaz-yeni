"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { useParams, usePathname, useRouter } from "next/navigation";
import { api } from "~/trpc/react";
import { v4 as uuidv4 } from "uuid";
import ReactQuill from 'react-quill-new';

import "react-quill-new/dist/quill.snow.css";
import { toast } from "sonner";
import Loading from "./loading";
import { CiBookmarkRemove, CiImageOn } from "react-icons/ci"; // CiImageOn eklendi
import { MdDeleteForever } from "react-icons/md"; // Yeni eklenen ikon

// ReactQuill'i SSR uyumlu hale getirme
const ReactQuillDynamic = dynamic(
    async () => {
        const { default: RQ } = await import('react-quill-new');
        // forwardRef to pass ref down to ReactQuill
        return React.forwardRef((props: any, ref) => <RQ {...props} ref={ref} />);
    },
    { ssr: false }
);

const Editor = () => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [description, setDescription] = useState("");
    const [tag, setTag] = useState("");
    const [selectedTags, setSelectedtags] = useState<string[]>([]);
    const router = useRouter();
    const params = useParams();
    const slug = params.slug as string;

    const quillRef = useRef(null);
    const [pictures, setPictures] = useState<string[]>([]); // Holds URLs of images in the rich text editor content
    const [galleryImages, setGalleryImages] = useState<string[]>([]); // Holds URLs of gallery images
    const [oldContent, setOldContent] = useState(""); // Used to revert content on failed submission/update
    const [loading, setLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [galeryLoading, setGaleryLoading] = useState(false);
    const [isMultimedia, setIsMultimedia] = useState(false); // Yeni state for multimedia

    // Haber detaylarını çekme (updatedata'nın `galleryImages` ve `multimedia` içerdiğinden emin olun)
    const { data: updatedata, isLoading: updateLoading, isError: updateError, refetch: updateFetch } =
        api.editor.article.getById.useQuery({ slug }, { enabled: !!slug });

    const { data: tagData, isLoading: tagIsLoading, isError: tagIsError, refetch: refetchTags } = api.editor.general.listTags.useQuery({ search: tag });
    const { data: categoryData, isLoading: categoryLoading, isError: categoryErr } = api.editor.general.listCategory.useQuery();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (slug && updatedata) {
            setTitle(updatedata.title);
            setContent(updatedata.content);
            setOldContent(updatedata.content);
            setDescription(updatedata.description);
            setSelectedCategory(updatedata.category);
            setSelectedtags(updatedata.tags.map(t => t.name));
            setGalleryImages(updatedata.galleryImages || []);
            setIsMultimedia(updatedata.multimedia || false); // Multimedia durumunu yükle

            // Rich text editor içeriğindeki mevcut görselleri ayıklama
            const parser = new DOMParser();
            const doc = parser.parseFromString(updatedata.content, "text/html");
            const images = doc.querySelectorAll("img");
            const existingContentImageUrls: string[] = [];
            images.forEach(img => {
                // Ensure to check against your Supabase URL
                if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
                    existingContentImageUrls.push(img.src);
                }
            });
            setPictures(existingContentImageUrls);
        } else {
            // Reset form for new article
            setTitle("");
            setContent("");
            setOldContent("");
            setDescription("");
            setSelectedCategory("");
            setSelectedtags([]);
            setPictures([]);
            setGalleryImages([]);
            setIsMultimedia(false); // Yeni makale için multimedia'yı sıfırla
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
            setContent(oldContent); // Revert content on error
        },
        onSuccess: () => {
            toast.success("Məqalə uğurla yaradıldı!");
            router.push("/admin/");
            setLoading(false);
        },
    });

    const updateArticleMutation = api.editor.article.update.useMutation({
        onError: (error) => {
            toast.error(`Məqalə güncəllənərkən xəta: ${error.message}`);
            setLoading(false);
            setContent(oldContent); // Revert content on error
        },
        onSuccess: () => {
            toast.success("Məqalə uğurla güncəlləndi!");
            void updateFetch();
            router.push("/admin/");
            setLoading(false);
        },
    });

    const uploadImageMutation = api.editor.storage.uploadFile.useMutation();
    const deleteImageMutation = api.editor.storage.deleteFile.useMutation(); // deleteFile mutasyonunuzun olduğundan emin olun

    // --- Rich Text Editor İçindeki Görseller İçin Fonksiyonlar ---
    const selectCustomImage = () => {
        if (typeof document !== "undefined") {
            const input = document.createElement("input");
            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
            input.click();

            input.onchange = async () => {
                if (!input.files) return;
                const file = input.files?.[0];

                if (file) {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);

                    reader.onload = () => {
                        const base64Image = reader.result;
                        if (base64Image) {
                            insertImageToEditor({ imageUrl: base64Image as string, name: file.name });
                        }
                    };
                }
            };
        }
    };

    const insertImageToEditor = ({ imageUrl, name }: { imageUrl: string; name: string }) => {
        if (!quillRef.current) return;
        const editor = (quillRef.current as any)?.getEditor();
        const range = editor.getSelection(true);
        const uniqueId = uuidv4();
        // Base64 image olarak ekle, submit anında Supabase'e yükleyeceğiz
        const imageHtml = `<img src="${imageUrl}" loading="lazy" alt="${name}-${uniqueId}" />`;
        editor.clipboard.dangerouslyPasteHTML(range.index, imageHtml, 'user');
    };

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

    // --- Galeri Görselleri İçin Fonksiyonlar ---
    const handleGalleryImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!event.target.files || !isMultimedia) return; // Sadece multimedia açıksa yükle

        const files = Array.from(event.target.files);
        setGaleryLoading(true); // Yükleme süresince yükleme göstergesini aç
        const uploadedUrls: string[] = [];

        for (const file of files) {
            try {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve, reject) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.onerror = error => reject(error);
                });
                reader.readAsDataURL(file);
                const base64Image = await base64Promise;

                const result = await uploadImageMutation.mutateAsync({
                    base64File: base64Image,
                    fileName: file.name,
                    fileType: file.type,
                    folder: 'gallery', // Galeri görselleri için ayrı bir klasör
                });
                uploadedUrls.push(result.url);
                toast.success(`'${file.name}' yüklendi.`);
            } catch (error: any) {
                console.error(`Galeri görseli yüklenirken hata: ${file.name}`, error);
                toast.error(`'${file.name}' yüklenemedi: ${error.message}`);
            }
        }
        setGalleryImages(prev => [...prev, ...uploadedUrls]); // Yüklenenleri mevcut galeriye ekle
        setGaleryLoading(false); // Yükleme bitti, yükleme göstergesini kapat
        event.target.value = ''; // Input'u sıfırla ki aynı dosyayı tekrar seçebilsin
    };

    const handleDeleteGalleryImage = async (imageUrl: string) => {
        setLoading(true);
        try {
            await deleteImageMutation.mutateAsync({ fileUrl: imageUrl });
            setGalleryImages(prev => prev.filter(url => url !== imageUrl));
            toast.success("Galeri görseli silindi.");
        } catch (error: any) {
            console.error("Galeri görseli silinirken hata:", error);
            toast.error(`Galeri görseli silinirken hata: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title || !content || !description || !selectedCategory) {
            toast.error("Bütün argumentləri doldurun !");
            return;
        }
        setLoading(true);

        try {
            // --- Rich Text Editor İçindeki Görselleri Yükleme Mantığı ---
            const parser = new DOMParser();
            const doc = parser.parseFromString(content, "text/html");
            const images = doc.querySelectorAll("img");

            const imagesToUpload: { oldSrc: string; newUrlPromise: Promise<string>; alt: string }[] = [];
            const finalContentImageURLs: string[] = []; // Ana içerik görsellerinin son URL'leri

            for (const img of images) {
                if (img.src.startsWith("data:image")) {
                    const fileName = img.alt || `image-${Date.now()}`;
                    const fileType = img.src.substring("data:".length, img.src.indexOf(";base64,"));
                    imagesToUpload.push({
                        oldSrc: img.src,
                        alt: img.alt,
                        newUrlPromise: uploadImageMutation.mutateAsync({
                            base64File: img.src,
                            fileName: fileName,
                            fileType: fileType,
                            folder: 'articles',
                        }).then(result => result.url),
                    });
                } else if (img.src.startsWith(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_URL!)) {
                    finalContentImageURLs.push(img.src);
                }
            }

            const newImageResults = await Promise.all(imagesToUpload.map(item => item.newUrlPromise));
            let updatedContent = content;

            imagesToUpload.forEach((item, index) => {
                const newSupabaseUrl = newImageResults?.[index];
                if (newSupabaseUrl) {
                    updatedContent = updatedContent.replace(item.oldSrc, newSupabaseUrl);
                    finalContentImageURLs.push(newSupabaseUrl);
                }
            });

            // --- Rich Text Editor Görsel Silme Mantığı (Güncelleme için) ---
            if (slug && updatedata) {
                const imagesToDelete = pictures.filter(url => !finalContentImageURLs.includes(url));
                for (const url of imagesToDelete) {
                    try {
                        await deleteImageMutation.mutateAsync({ fileUrl: url });
                        toast.info(`İçerik görseli silindi: ${url.substring(url.lastIndexOf('/') + 1)}`);
                    } catch (deleteError: any) {
                        console.error(`İçerik resmi silinirken hata oluştu: ${url}`, deleteError);
                        toast.error(`İçerik resmi silinirken hata: ${deleteError.message}`);
                    }
                }
            }
            setPictures(finalContentImageURLs); // State'i güncelle


            // --- Makale Oluşturma/Güncelleme ---
            const articleData = {
                title,
                content: updatedContent,
                category: selectedCategory,
                imagesUrl: finalContentImageURLs, // Ana içerik görselleri
                galleryImages: isMultimedia ? galleryImages : [], // Sadece multimedia açıksa galeri görsellerini gönder
                description,
                tags: selectedTags,
                multimedia: isMultimedia, // Multimedia değerini gönder
            };

            if (slug && updatedata) {
                await updateArticleMutation.mutateAsync({ id: updatedata.id, ...articleData });
            } else {
                await createArticleMutation.mutateAsync(articleData);
            }

        } catch (error: any) {
            console.error("Məqalə yaradılarkən/güncəllənərkən xəta baş verdi:", error);
            toast.error(`Əməliyyat zamanı xəta: ${error.message || "Bilinməyən xəta"}`);
            setLoading(false);
            setContent(oldContent); // Revert content on general error
        } finally {
            setLoading(false);
            setGaleryLoading(false);
        }
    };

    if (!isMounted || (slug && updateLoading)) {
        return <Loading />;
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
                        className="px-2 py-2 input input-bordered w-full"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <label htmlFor="description" className="text-titleText">Açıqlama</label>
                    <textarea
                        name="description"
                        placeholder="Açıqlama"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="px-2 pt-2 pb-2 input input-bordered w-full min-h-[80px]"
                    />
                </div>

                {/* Multimedia Seçeneği */}
                <div className="flex items-center gap-2">
                    <input
                        id="multimedia"
                        type="checkbox"
                        className="checkbox"
                        checked={isMultimedia}
                        onChange={(e) => setIsMultimedia(e.target.checked)}
                    />
                    <label htmlFor="multimedia" className="text-titleText">Multimedia İçerik</label>
                </div>

                {/* Galeri Görselleri Bölümü (Sadece Multimedia açıksa göster) */}
                {isMultimedia && (
                    <div className="flex flex-col gap-3">
                        <label className="text-titleText flex items-center gap-2">
                            <CiImageOn className="text-xl" /> Galeri Görselleri
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple // Çoklu dosya seçimine izin ver
                            onChange={handleGalleryImageUpload}
                            className="file-input file-input-bordered w-full" // Tailwind/DaisyUI class'ları
                        />
                        {galeryLoading && <div>Yükleniyor...</div>}
                        {galleryImages.length > 0 && (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                {galleryImages.map((imageUrl) => (
                                    <div key={imageUrl} className="relative group w-full aspect-video overflow-hidden rounded-lg shadow-md">
                                        <img
                                            src={imageUrl}
                                            alt="Galeri Görseli"
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteGalleryImage(imageUrl)}
                                            className="absolute top-2 right-2 bg-red-600 p-1 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            title="Görseli Sil"
                                        >
                                            <MdDeleteForever className="text-xl" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                {/* --- Galeri Görselleri Bölümü Sonu --- */}


                <div className="flex flex-col gap-1 relative">
                    {selectedTags.length > 0 && (
                        <ul className="flex flex-wrap mb-2">
                            {selectedTags.map(tagItem => (
                                <li key={tagItem} className="px-2 py-1 flex gap-2 items-center bg-gray-100 rounded-md mr-2 mb-2">
                                    <span className='flex gap-1 items-center'>
                                        #{tagItem}
                                    </span>
                                    <div className='group relative'>
                                        <CiBookmarkRemove onClick={() => removeTagFromArticle(tagItem)} className='text-lg cursor-pointer text-red-500 hover:text-red-700' />
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
                                {tagData.filter(t => !selectedTags.includes(t.name)).map(tagItem => (
                                    <li onClick={() => addTagToArticle(tagItem.name)} key={tagItem.id} className="px-3 py-2 text-contentText cursor-pointer hover:bg-gray-100">
                                        {tagItem.name}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {isMounted ? (
                    <ReactQuillDynamic
                        ref={quillRef}
                        value={content}
                        onChange={(newContent: string) => {
                            if (oldContent === "") setOldContent(content);
                            setContent(newContent);
                        }}
                        modules={modules}
                        formats={formats}
                        theme="snow"
                        className="text-contentText bg-white min-h-[300px] prose max-w-none"
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
                            <option key={category?.id} value={category?.urlName}>
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