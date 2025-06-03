"use client";
import React, { createContext, useContext, useState } from "react";

type Category = {
  id: string;
  name: string;
  urlName: string;
};

type Tag = {
  id: string;
  name: string;
  tagValue: string;
};

type ContextType = {
  selectedCategory: Category | null;
  setSelectedCategory: (c: Category | null) => void;
  selectedTag: Tag | null;
  setSelectedTag: (t: Tag | null) => void;
};

const CategoryContext = createContext<ContextType>({
  selectedCategory: null,
  setSelectedCategory: () => {},
  selectedTag: null,
  setSelectedTag: () => {},
});

export const CategoryProvider = ({
  children,
}: { 
  children: React.ReactNode;
}) => {
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  return (
    <CategoryContext.Provider
      value={{ selectedCategory, setSelectedCategory, selectedTag, setSelectedTag }}
    >
      {children}
    </CategoryContext.Provider>
  );
};

// custom hooks
export const useSelectedCategory = () => {
  const ctx = useContext(CategoryContext);
  return [ctx.selectedCategory, ctx.setSelectedCategory] as const;
};

export const useSelectedTag = () => {
  const ctx = useContext(CategoryContext);
  return [ctx.selectedTag, ctx.setSelectedTag] as const;
};
