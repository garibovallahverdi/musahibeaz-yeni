'use client';
import React, { useState } from 'react';
import { api } from '~/trpc/react';
import Loading from '../_components/loading';
import SkeletonLoader from '~/app/_components/general/SkeletonLoader';
import { CiBookmarkRemove } from 'react-icons/ci';
import { toast } from 'sonner';

const TagPage = () => {
  const [newTag, setNewTag] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  /* --- veriler --- */
  const {
    data: tags,
    isLoading: isLoadingTags,
    refetch: refetchTags,
  } = api.admin.tag.list.useQuery({});

  const {
    data: categories,
    isLoading: isLoadingCategories,
  } = api.admin.article.getAllCategory.useQuery(undefined, {
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  /* --- mutasyonlar --- */
  const { mutate: addTag, isPending: isAdding } =
    api.admin.tag.create.useMutation({
      onSuccess: () => {
        void refetchTags();
        setNewTag('');
        toast.success('Tag uğurla əlavə olundu');
      },
      onError: (e) => toast.error(e.message),
    });

  const { mutate: removeTag, isPending: isRemoving } =
    api.admin.tag.remove.useMutation({
      onSuccess: () => void refetchTags(),
      onError: (e) => toast.error(e.message),
    });

  /* --- handler --- */
  const handleAddTag = () => {
    if (!newTag.trim() || !selectedCategoryId)
      return toast.warning('Zəhmət olmasa etiket və kateqoriya seçin');
    addTag({ tag: newTag, categoryId: selectedCategoryId });
  };

  /* --- yükleme --- */
  if (isLoadingTags || isLoadingCategories) return <Loading />;

  return (
    <div className="grid gap-6 rounded-md bg-white p-6 shadow md:grid-cols-2">
      {/* ------------ Yeni tag ekleme ------------- */}
      <div className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Yeni Tag əlavə et</h2>

        {/* Etiket input */}
        <input
          type="text"
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          placeholder="Yeni etiket..."
          className="rounded border p-2"
        />

        {/* Kategori seçimi */}
        <select
          value={selectedCategoryId}
          onChange={(e) => setSelectedCategoryId(e.target.value)}
          className="rounded border p-2"
        >
          <option value="">Kateqoriya seç...</option>
          {categories?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        {/* Ekle butonu */}
        <button
          onClick={handleAddTag}
          disabled={isAdding}
          className="self-start rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          {isAdding ? 'Əlavə olunur…' : 'Əlavə et'}
        </button>
      </div>

      {/* ------------ Tag listesi ------------- */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Mövcud Taglər</h2>

        {isRemoving && (
          <p className="mb-2 text-sm text-red-500">Tag silinir…</p>
        )}

        {!tags?.length ? (
          <p>Tag mövcud deyil</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <li
                key={t.id}
                className="flex items-center gap-2 rounded bg-gray-100 px-2 py-1"
              >
                #{t.name}
                <CiBookmarkRemove
                  onClick={() => removeTag({ tag: t.name })}
                  className="cursor-pointer text-lg text-red-600 hover:text-red-700"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TagPage;
