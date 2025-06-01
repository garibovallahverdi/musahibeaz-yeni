"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSun, FiMoon, FiSearch, FiX, FiMenu } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "~/app/providers/ThemeProvider";
import TagsList from "./TagList";
import SearchInput from "../common/SearchInput";

type Category = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
} | null;

type Tag = {
  id: string;
  name: string;
  tagValue: string;
  updatedAt: Date;
} | null;

const extraRoutes = [
  { href: "/about", label: "Haqqımızda" },
  { href: "/contact", label: "Əlaqə" },
  { href: "/law", label: "Əlaqədar Qanunlar" },
];

export default function Navbar({ category, tag }: { category: Category[]; tag: Tag[] }) {
  const [mobileMenu, setIsMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const allRoutes = [
    { href: "/", label: "Əsas səhifə" },
    ...(category?.map((c) => ({
      href: `/news/${c?.name}`,
      label: c?.name,
    })) ?? []),
  ];

  const mainLinks = allRoutes.slice(0, 5);
  const moreLinks = allRoutes.slice(5);

  return (
    <nav className="bg-background border-b  border-gray-200 dark:border-gray-700 shadow-sm z-50">
      {/* Mobil Menü */}
      {mobileMenu && (
        <div className="fixed inset-0 z-[999] bg-background dark:bg-gray-900 flex flex-col p-8">
          <div className="flex justify-between items-center mb-6">
            <span className="text-xl font-bold text-gray-900 dark:text-white">Menu</span>
            <MdOutlineCancel
              onClick={() => setIsMobileMenu(false)}
              className="text-3xl cursor-pointer text-gray-900 dark:text-white hover:text-blue-600 transition-all"
            />
          </div>
          <div className="flex flex-col space-y-4">
            {allRoutes.map((route, idx) => (
              <Link
                key={idx}
                href={route.href}
                prefetch={false}
                onClick={() => setIsMobileMenu(false)}
                className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600"
              >
                {route.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center relative  justify-between h-16">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center space-x-2">
            <Image width={32} height={32} src="/logo.png" className="h-8" alt="Logo" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Musahibe.az</span>
          </Link>

          {/* Menüler - Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            {mainLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                prefetch={false}
                className="text-gray-900 dark:text-white hover:text-blue-600 font-medium"
              >
                {link.label}
              </Link>
            ))}
          {moreLinks.length > 0 && (
  <div className="bg-whte dark:bg-gray-800 ">
    <button
      onClick={() => setDropdownOpen(!dropdownOpen)}
      className="text-gray-900 dark:text-white hover:text-blue-600 font-medium flex items-center"
    >
      Daha çox <span className="ml-1 text-xs">▼</span>
    </button>

    {dropdownOpen && (
      <div
        className="absolute right-0   top-full w-full bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-xl z-50"
        onMouseLeave={() => setDropdownOpen(false)}
      >
        <div className="max-w-full-xl mx-auto px-6 py-8 grid grid-cols-3 gap-6">
          {moreLinks.map((link, idx) => (
            <div key={idx}>
              <Link
                href={link.href}
                prefetch={false}
                className="block text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600"
              >
                {link.label}
              </Link>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {link.label} haqqında qısa məlumat və ya kateqoriyanın təsviri burada ola bilər.
              </p>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}
          </div>

          {/* Sağ Butonlar */}
          <div className="flex items-center space-x-4">
            <button onClick={() => setShowSearch(!showSearch)} className="p-2 text-gray-900 dark:text-white hover:text-blue-600">
              {showSearch ? <FiX size={20} /> : <FiSearch size={20} />}
            </button>
            <button onClick={toggleTheme} className="p-2 text-gray-900 dark:text-white hover:text-blue-600">
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-gray-900 dark:text-white hover:text-blue-600">
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        {/* TagList ya da Arama */}
        <div className="w-full flex items-center justify-between py-4">
          {showSearch ? <SearchInput /> : <TagsList tag={tag ?? []} />}
        </div>
      </div>
    </nav>
  );
}
