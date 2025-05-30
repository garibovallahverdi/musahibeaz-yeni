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

  return (
    <div className=" p-4 rounded-lg w-full  overflow-x-scroll">
      <div className="flex   gap-2">
        {tag?.map((tag) => (
          <Link
            key={tag?.id}
            rel="preconnect"
            prefetch={false}
            href={`/tag/${tag?.name}`}
            // href={`/etiket/${tag.toLowerCase()}`}
            className="px-3 py-1 border min-w-max    text-sm rounded-xl text-titleText transition"
          >
            {tag?.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
