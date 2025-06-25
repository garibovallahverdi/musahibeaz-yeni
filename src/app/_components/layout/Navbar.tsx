"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiSun, FiMoon, FiSearch, FiX, FiMenu } from "react-icons/fi";
import { MdOutlineCancel } from "react-icons/md";
import { useTheme } from "~/app/providers/ThemeProvider";
import { ChevronRight } from "lucide-react";
import AccordionItem from "../common/MobileMenuAccordionItem";
import SocialMediLinks from "../common/SocialMediLinks";

type Category = {
  name: string;
  urlName: string;
  children: Category[]; // Recursive type for nested children
};
 type Route = {
  label: string;
  href: string;
  children: { label: string; href: string }[];
};

type SplitResult = {
  parentCategories: Route[];
  singleCategories: Route[];
};

export function splitCategories(categories: Category[]): SplitResult {
  const parentCategories: Route[] = [];
  const singleCategories: Route[] = [];

  categories.forEach((c) => {
    const hasChildren = c.children && c.children.length > 0;

    const route: Route = {
      label: c.name,
      href: `/${c.urlName}`,
      children: c.children.map((child) => ({
        label: child.name,
        href: `/${c.urlName}/${child.urlName}`,
      })),
    };

    if (hasChildren) {
      parentCategories.push(route);
    } else {
      singleCategories.push(route);
    }
  });

  return { parentCategories, singleCategories };
}


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
const { parentCategories, singleCategories } = splitCategories(category);

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

  

  // const mainLinks = allRoutes
  const moreLinks = allRoutes
  const mainLinks = [
        {
      label:"Xəbərlər",
      href: "/xeberler",
      children: [],
    },
        {
      label:"Si̇yasət",
      href: "/si̇yaset",
      children: [],
    },
       {
      label:"İdman",
      href: "/i̇dman",
      children: [],
    },
       {
      label:"İqti̇sadi̇yyat",
      href: "/i̇qti̇sadi̇yyat",
      children: [],

    },
       {
      label:"Cəmi̇yyət",
      href: "/cemi̇yyet",
      children: [],

    },

    ...parentCategories,

  ]


  return (
    <nav className="bg-background border-b  border-gray-200 dark:border-gray-700 shadow-sm z-50">
      {/* Mobil Menü */}
         {mobileMenu && (
        <div className="fixed inset-0 overflow-y-auto z-[999] bg-background dark:bg-gray-900 p-6">
          <div className="flex justify-end mb-4">
            <MdOutlineCancel
              onClick={() => setIsMobileMenu(false)}
              className="text-3xl cursor-pointer text-titleText hover:text-blue-600 transition"
            />
          </div>
          <div className="flex flex-col gap-4">
            {[...singleCategories, ...parentCategories].map((route, idx) => (
              <AccordionItem setIsMobileMenu={setIsMobileMenu} key={idx} route={route} />
            ))}
          </div>
        </div>
      )}


      {/* Desktop Navbar */}
      <div className="max-w-screen-xl relative mx-auto px-4 py-2">
        <div className="flex items-center justify-between h-16  relative">
          {/* Logo */}
          <Link href="/" prefetch={false} className="flex items-center space-x-2">
            <Image width={32} height={32} src="/logo.png" alt="Logo" className="h-8 w-8" />
            <span className="text-2xl hidden sm:block font-bold text-gray-900 dark:text-white">MÜSAHİBƏ</span>
          </Link>
           

       
          <div className="flex items-center justify-between  md:w-auto space-x-4">

            <div className="hidden md:block ">
              <SocialMediLinks/>
            </div>
          {/* Sağ Butonlar */}
          <div className="flex items-center space-x-3">
          
            <button onClick={toggleTheme} className="p-2 text-gray-900 dark:text-white hover:text-blue-600">
              {theme === "dark" ? <FiSun size={20} /> : <FiMoon size={20} />}
            </button>
            <button onClick={() => setIsMobileMenu(!mobileMenu)} className="md:hidden p-2 text-gray-900 dark:text-white hover:text-blue-600">
              <FiMenu size={20} />
            </button>
          </div>
          </div>

        </div>

          {/* Menü - Desktop */}

        <div className="hidden w-full  md:flex justify-center  py-2">

         <div className="items-center space-x-2  flex justify-between gap-1">
          {mainLinks.map((link, idx) =>
            link.children && link.children.length > 0 ? (
              <div key={idx} className="relative group">
                <button
                  className="max-w-max uppercase whitespace-nowrap overflow-hidden text-gray-900 dark:text-white hover:text-blue-600 font-medium text-sm flex items-center gap-1"
                  type="button"
                >
                  {link.label}
                  <ChevronRight className="rotate-90 w-4 h-4" />
                </button>
                <div className="absolute left-0 top-full mt-2 min-w-[160px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-opacity z-50">
                  <div className="flex flex-col py-2">
                    {link.children.map((child, cidx) => (
                      <Link
                        key={cidx}
                        href={child.href}
                        prefetch={false}
                        className="px-4 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <Link
                key={idx}
                href={link.href}
                prefetch={false}
                className="max-w-max uppercase whitespace-nowrap overflow-hidden text-gray-900 dark:text-white hover:text-blue-600 font-medium text-sm"
                title={link.label}
              >
                {link.label}
              </Link>
            )
          )}
 {moreLinks.length > 0 && (
              <div className="">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="text-gray-900 dark:text-white hover:text-blue-600 font-medium text-sm flex items-center"
                >
               <FiMenu size={20} />
                </button>
              

                {dropdownOpen && (
                  <div
                    className="absolute left-0 top-full w-full  bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-lg mt-2 z-50"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-6 py-4 flex flex-wrap justify-center gap-x-10 gap-y-5">
                      {[...singleCategories].map((link, idx) => (
                         (
                        <Link
                          key={idx}
                          href={link.href}
                          prefetch={false}
                          className="flex justify-center w-max items-center  border-2 rounded-full px-5 py-1 uppercase text-sm  text-gray-900 dark:text-white  truncate"
                        >
                          {truncateWords(link.label)}
                          
                        </Link>
                        )
//                     
                      ))}

                      {[...parentCategories].map((link) => (
                          link.children.map((child,cidx)=> (
                        <Link
                          key={cidx}
                          href={child.href}
                          prefetch={false}
                          className="block  border-2 rounded-full px-4 py-1 uppercase text-sm  text-gray-900 dark:text-white  truncate"
                        >
                          {truncateWords(child.label)}
                        </Link>
                        )
                      )
//                     
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          
          </div>

        </div>

      </div>
    </nav>
  );
}
