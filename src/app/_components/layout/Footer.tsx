'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

const Footer = () => {

  return (
    <footer className="text-contentText body-font bg-card_bg dark:bg-gray-900 dark:border-gray-700 shadow-md">
      <div className="container mx-auto flex flex-wrap p-5 flex-col md:flex-row items-center">
        <Link href="/" className="flex title-font font-medium items-center text-gray-900 dark:text-white mb-4 md:mb-0">
         <Image width={32} height={32} alt='' src={"/logo.png"}/>
          <span className="ml-3 text-xl">Mushibe.az</span>
        </Link>
        <nav className="md:ml-auto flex flex-wrap items-center text-base justify-center">
          {/* <Link href="/first" className="mr-5 hover:text-gray-900 dark:hover:text-gray-300">First Link</Link>
          <Link href="/second" className="mr-5 hover:text-gray-900 dark:hover:text-gray-300">Second Link</Link>
          <Link href="/third" className="mr-5 hover:text-gray-900 dark:hover:text-gray-300">Third Link</Link>
          <Link href="/fourth" className="mr-5 hover:text-gray-900 dark:hover:text-gray-300">Fourth Link</Link> */}
        </nav>
      
      </div>
    </footer>
  );
};

export default Footer;
