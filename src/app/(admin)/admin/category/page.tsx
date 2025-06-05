'use client'
import React, { useState } from 'react';
import { api } from '~/trpc/react';
import Loading from '../_components/loading'; // Assuming this path is correct
import { CiBookmarkRemove } from "react-icons/ci";
import { toast } from 'sonner'; // Assuming sonner is configured

// Define a type for your category data for better type safety
interface Category {
    id: string;
    name: string;
    parentId: string | null;
    urlName: string; // Assuming urlName also exists based on your backend
}

const CategoryPage = () => {
    const [newCategoryName, setNewCategoryName] = useState("");
    // Using null for no parent category is often clearer than undefined for selects
    const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);

    // Fetch all categories
    const { data: categories, isLoading, isError, refetch } = api.admin.article.getAllCategory.useQuery(undefined, {
        staleTime: Infinity,
        refetchOnMount: false,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false
    });

    // Mutation for creating a new category
    const { mutate: addCategory, isPending: isAdding } = api.admin.article.createCategory.useMutation({
        onSuccess: (data) => {
            void refetch(); // Re-fetch categories to update the list
            setNewCategoryName(""); // Clear input field
            setSelectedParentCategory(null); // Reset parent selection
            toast.success(data.message);
        },
        onError: (error) => {
            console.error("Kategori ekleme hatası:", error.message);
            toast.error(`Kategori eklenirken hata oluştu: ${error.message}`);
        },
    });

    // --- Optional: Uncomment and implement removeCategory if you have it ---
    // const { mutate: removeCategory, isPending: isRemoving } = api.admin.article.removeCategory.useMutation({
    //   onSuccess: (data) => {
    //     void refetch();
    //     toast.success(data.message || "Kategori başarıyla silindi.");
    //   },
    //   onError: (error) => {
    //     console.error("Kategori silme hatası:", error.message);
    //     toast.error(`Kategori silinirken hata oluştu: ${error.message}`);
    //   },
    // });

    // const handleRemoveCategory = (categoryId: string) => {
    //   // You might want to add a confirmation dialog here
    //   if (window.confirm("Bu kategoriyi silmek istediğinizden emin misiniz? Alt kategorileri de silinebilir.")) {
    //     removeCategory({ id: categoryId }); // Assuming your removeCategory mutation takes an 'id'
    //   }
    // }
    // --- End of Optional section ---

    const handleAddCategory = () => {
        if (!newCategoryName.trim()) {
            toast.error("Kategori adı boş olamaz.");
            return;
        }
        addCategory({ category: newCategoryName, parentId: selectedParentCategory ?? undefined });
    };

    if (isLoading) return <Loading />;
     <div className="text-red-500 p-4">Kategoriyalar yüklənərkən xəta baş verdi.</div>;

    // Helper function to render categories recursively for indentation
    const renderCategories = (parentId: string | null) => {
        // Filter categories that have the given parentId (or null for top-level)
        const filteredCategories = categories?.filter(cat => cat.parentId === parentId) || [];

        // Sort categories by name for a consistent display
        filteredCategories.sort((a, b) => a.name.localeCompare(b.name));

        return (
            <ul className={parentId ? "ml-6 mt-1" : ""}> {/* Indent subcategories */}
                {filteredCategories.map(category => (
                    <li key={category.id} className="py-1">
                        <div className="flex items-center gap-2 text-gray-800">
                            <span className="font-medium text-blue-800">{category.name}</span>
                            {/* Optional: Add a remove button */}
                            {/* <button
                                onClick={() => handleRemoveCategory(category.id)}
                                className="text-red-500 hover:text-red-700 tooltip tooltip-right"
                                data-tip="Kategoriyi Sil"
                                disabled={isRemoving} // if using the removeCategory mutation
                            >
                                <CiBookmarkRemove size={18} />
                            </button> */}
                        </div>
                        {/* Recursively render children */}
                        {renderCategories(category.id)}
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div className="grid lg:grid-cols-4 gap-6 items-start mx-auto p-6 bg-white shadow-md rounded-md">
            {/* New Category Addition Section */}
            <div className="flex flex-col col-span-2 gap-4 p-4 border border-gray-200 rounded-md bg-gray-50">
                <h2 className="text-2xl font-bold text-gray-800">Yeni Kategoriya Əlavə Et</h2>

                {/* Category Name Input */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="newCategoryName" className="text-base font-medium text-gray-700">Kateqoriya Adı</label>
                    <input
                        id="newCategoryName"
                        type="text"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="input input-bordered w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Yeni kategori adını girin..."
                        aria-label="Yeni kategori adı"
                    />
                </div>

                {/* Parent Category Selection */}
                <div className="flex flex-col gap-2">
                    <label htmlFor="parentCategory" className="text-base font-medium text-gray-700">
                        Üst Kateqoriya Seçin (İstəyə bağlı)
                    </label>
                    <select
                        id="parentCategory"
                        disabled
                        value={selectedParentCategory ?? ''} // Use nullish coalescing for select value
                        onChange={(e) => setSelectedParentCategory(e.target.value || null)} // Set to null if empty string
                        className="select select-bordered w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        aria-label="Üst kategori seçimi"
                    >
                        <option value="">Ana Kategori Yarat</option>
                        {categories?.filter(cat => cat.parentId === null).map(category => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>
                    <p className="text-sm text-gray-500 mt-1">
                        Əgər üst kateqoriya seçsəniz, bu bir **alt kateqoriya** olacaq. Seçməsəniz, **ana kateqoriya** kimi əlavə olunacaq.
                    </p>
                </div>

                <button
                    onClick={handleAddCategory}
                    className="btn bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 w-full py-2 px-4 rounded-md font-semibold transition duration-200 ease-in-out"
                    disabled={isAdding}
                >
                    {isAdding ? "Əlavə Edilir..." : "Əlavə Et"}
                </button>
            </div>

            {/* Existing Categories List */}
            <div className='col-span-2 p-4 border border-gray-200 rounded-md bg-gray-50'>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Mövcud Kategoriyalar</h2>

                {categories && categories.length > 0 ? (
                    <div className='flex flex-col gap-3'>
                        {/* Start rendering from the top-level categories (parentId: null) */}
                        {renderCategories(null)}
                    </div>
                ) : (
                    <p className="text-gray-600">Hələ heç bir kategori yoxdur.</p>
                )}
            </div>
        </div>
    );
};

export default CategoryPage;