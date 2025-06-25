"use client";
import { ChevronDown, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

interface Route {
  label: string;
  href: string;
  children: { label: string; href: string }[];
}

export default function AccordionItem({ route,setIsMobileMenu }: { route: Route ,setIsMobileMenu: (isOpen: boolean) => void}) {
  const [open, setOpen] = useState(false);
  const hasChildren = route.children.length > 0;

  return (
    <div className="flex flex-col">
      {hasChildren ? (
        <>
          <button
            onClick={() => setOpen(!open)}
            className="flex justify-between w-full uppercase text-titleText font-medium text-sm"
          >
            {route.label}
            {open ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </button>
          {open && (
            <div className="pl-4 mt-1 flex flex-col gap-2">
              {route.children.map((child, idx) => (
                <Link
                  key={idx}
                  href={child.href}
                  onClick={() => setIsMobileMenu(false)} 
                  prefetch={false}
                  className="text-xs text-gray-700 dark:text-gray-300 hover:text-blue-600 uppercase"
                >
                  {child.label}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={route.href}
          prefetch={false}
          onClick={() => setIsMobileMenu(false)}
          className="uppercase text-sm text-titleText font-medium"
        >
          {route.label}
        </Link>
      )}
    </div>
  );
}
