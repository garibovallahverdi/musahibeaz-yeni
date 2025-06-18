"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSun, FiMoon, FiSearch, FiX, FiMenu } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "~/app/providers/ThemeProvider";
import { ChevronRight } from "lucide-react";
import AccordionItem from "../common/MobileMenuAccordionItem";

type Category = {
  name: string;
  urlName: string;
  children: Category[]; // Recursive type for nested children
};
 

const extraRoutes = [
  { href: "/about", label: "Haqqımızda" },
  { href: "/contact", label: "Əlaqə" },
  { href: "/law", label: "Əlaqədar Qanunlar" },
];

// 2 kelimeyle sınırla (istenirse)
const truncateWords = (label: string, maxWords = 2) => {
  const words = label.trim().split(" ");
  return words.length > maxWords ? words.slice(0, maxWords).join(" ") + "…" : label;
};

export default function Navbar({ category }: { category: Category[] }) {
  const [mobileMenu, setIsMobileMenu] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

    const allRoutes = [
      ...(category?.map((c) => {
        const categoryRoute = {
          href: `/${c.urlName}`,
          label: c?.name,
          children: c.children ? c.children.map((child) => ({
            href: `/${c.urlName}/${child?.urlName}`,
            label: child?.name,
          })) : [],
        };

        return categoryRoute;
      }) ?? []),
    ];


  console.log(allRoutes[12], "childres");
  
useEffect(() => {
    if (mobileMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenu]);

  

  const mainLinks = allRoutes.slice(0, 5);
  const moreLinks = allRoutes

  return (
    <nav className="bg-background border-b  border-gray-200 dark:border-gray-700 shadow-sm z-50">
      {/* Mobil Menü */}
      {mobileMenu && (
        <div className="fixed inset-0 overflow-y-auto z-[999] bg-background dark:bg-gray-900 flex flex-col p-8">
          <div className="flex justify-end items-center mb-6">
            <MdOutlineCancel
              onClick={() => setIsMobileMenu(false)}
              className="text-3xl cursor-pointer text-titleText hover:text-blue-600 transition-all"
            />
          </div>
          <div className="flex flex-col justify-start items-start space-y-4">
            {allRoutes.map((route, idx) => (
              <AccordionItem key={idx} route={route} />
              
            ))}
          </div>
        </div>
      )}

      {/* Desktop Navbar */}
      <div className="max-w-screen-xl relative mx-auto px-4 ">
        <div className="flex items-center justify-between h-16 relative">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center space-x-2">
            <Image width={32} height={32} src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl hidden sm:block font-bold text-gray-900 dark:text-white">Musahibe.az</span>
          </Link>

          {/* Menü - Desktop */}
          <div className="hidden lg:flex items-center space-x-4">
            {mainLinks.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                prefetch={false}
                className="max-w-max uppercase whitespace-nowrap overflow-hidden text-gray-900 dark:text-white hover:text-blue-600 font-medium text-sm"
                title={link.label}
              >
                {link.label}
              </Link>
            ))}

            {moreLinks.length > 0 && (
              <div className="">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-gray-900 dark:text-white hover:text-blue-600 font-medium text-sm flex items-center"
                >
                  Daha çox <span className="ml-1 text-xs">▼</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute left-0 top-full w-full  bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg mt-2 z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-6 py-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {moreLinks.map((link, idx) => (
                        <div key={idx} className="flex flex-col gap-2">
                          <p
                            // href={link.href}
                            // prefetch={false}
                            className="block uppercase text-sm font-semibold text-gray-900 dark:text-white  truncate"
                          >
                            {link.label}
                          </p>
 <div className="flex flex-col gap-1">
  {link.children.length > 0 &&
    link.children.map(({href, label}, index) => (
      <Link
        key={index}
        href={href}
        prefetch={false}
        className="block uppercase text-xs font-normal text-gray-900 dark:text-white hover:text-blue-600 truncate"
      >
        {label}
      </Link>
    ))}
</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sağ Butonlar */}
          <div className="flex items-center space-x-3">
          
            <button onClick={toggleTheme} className="p-2 text-gray-900 dark:text-white hover:text-blue-600">
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenu(!mobileMenu)} className="lg:hidden p-2 text-gray-900 dark:text-white hover:text-blue-600">
              <FiMenu size={20} />
            </button>
          </div>
        </div>

        {/* TagList ya da Search */}
        {/* <div className="w-full flex items-center justify-between py-4">
          <TagsList tag={tag ?? []} />
        </div> */}
      </div>
    </nav>
  );
}
