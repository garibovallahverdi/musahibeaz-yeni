"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

type Tag = {
  id: string;
  name: string;
  tagValue: string;
  updatedAt: Date;
} | null;

export default function TagsList({tag}:{tag:Tag[]}) {
  const [sortedTags, setSortedTags] = useState<Tag[]>([]);


  useEffect(() => {
    setSortedTags([...tag].sort()); // Alfabetik sıralama
  }, []);

    const allTags = [
   
    ...(sortedTags?.map((c) => ({
      href: `/tag/${c?.tagValue}`,
      label: c?.name
    })) ?? []),
  ];

  return (
    <div className=" p-4 rounded-lg w-full  overflow-x-scroll">
      <div className="flex   gap-2">
        {allTags?.map((tag) => (
          <Link
            key={tag?.href}
            rel="preconnect"
            prefetch={false}
            href={tag?.href}
            // href={`/etiket/${tag.toLowerCase()}`}
            className="px-3 py-1 border min-w-max    text-sm rounded-xl text-titleText transition"
          >
            {tag?.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
