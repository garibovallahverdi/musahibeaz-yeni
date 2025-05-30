"use client";
import { useState } from "react";
import Link from "next/link";
import { FiSun, FiMoon, FiSearch, FiX, FiMenu } from "react-icons/fi";
import Image from "next/image";
import { useTheme } from "~/app/providers/ThemeProvider";
import TagsList from "./TagList";
import SearchInput from "../common/SearchInput";
import { api } from "~/trpc/react";
import { MdOutlineCancel } from "react-icons/md";

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
export default function Navbar({category, tag}:{category: Category[], tag:Tag[]}) {
  const [mobileMenu, setIsMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-background border-b border-gray-200 dark:border-gray-700 shadow-sm">
      {/* Mobil Menü */}
      {mobileMenu && (
        <div className="fixed w-screen h-screen z-[999] top-0 bg-background dark:bg-gray-900 flex flex-col justify-center items-center">
          <MdOutlineCancel
            onClick={() => setIsMobileMenu(false)}
            className="absolute top-6 right-6 text-2xl cursor-pointer text-gray-900 dark:text-white hover:text-blue-600 transition-all"
          />
          <div className="w-full flex flex-col items-center space-y-4">
            <Link
              href="/"
              rel="preconnect"
              prefetch={false}
              onClick={() => setIsMobileMenu(false)}
              className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600"
            >
              Əsas səhifə
            </Link>
            {category?.map((category) => (
              <Link
                key={category?.id}
                
                rel="preconnect"
                prefetch={false}
                href={`/news/${category?.name}`}
                onClick={() => setIsMobileMenu(false)}
                className="text-xl font-semibold text-gray-900 dark:text-white hover:text-blue-600"
              >
                {category?.name}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Ana Navbar */}
      <div className="max-w-screen-xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            rel="preconnect"
            prefetch={false}
            href="/" 
            className="flex items-center space-x-3">
            <Image width={32} height={32} src="/logo.png" className="h-8" alt="Haber Sitesi" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">Musahibe.az</span>
          </Link>

          {/* Navbar Menü (Masaüstü) */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link   
              rel="preconnect"
              prefetch={false} 
              href="/" 
              className="text-gray-900 dark:text-white hover:text-blue-600 font-medium">
              Əsas səhifə
            </Link>
            {category?.slice(0, 5)?.map((category) => (
              <Link
                key={category?.id}
                href={`/news/${category?.name}`}
                className="text-gray-900 dark:text-white hover:text-blue-600 font-medium"
              >
                {category?.name}
              </Link>
            ))}
            {category && category?.length > 5 && (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-gray-900 dark:text-white hover:text-blue-600 font-medium flex items-center"
                >
                  Daha çox <span className="ml-1">▼</span>
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-2 bg-white dark:bg-gray-800 shadow-lg rounded-md w-48 z-50">
                    {category?.slice(5).map((category) => (
                      <Link
                        rel="preconnect"
                        prefetch={false}
                        key={category?.id}
                        href={`/news/${category?.name}`}
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        {category?.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağdaki Butonlar */}
          <div className="flex items-center space-x-4">
            {/* Arama Butonu */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className="p-2 text-gray-900 dark:text-white hover:text-blue-600"
            >
              {showSearch ? <FiX size={20} /> : <FiSearch size={20} />}
            </button>

            {/* Tema Değiştirme Butonu */}
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-900 dark:text-white hover:text-blue-600"
            >
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>

            {/* Mobil Menü Butonu */}
            <button
              onClick={() => setIsMobileMenu(!mobileMenu)}
              className="lg:hidden p-2 text-gray-900 dark:text-white hover:text-blue-600"
            >
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        {/* TagList veya SearchInput */}
        <div className="w-full flex items-center justify-between py-4">
          {showSearch ? <SearchInput /> : <TagsList tag={tag ?? []} />}
        </div>
      </div>
    </nav>
  );
}