'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import SocialMediLinks from '../common/SocialMediLinks';

const Footer = () => {

  return (
    <footer className="text-contentText body-font bg-card_bg dark:bg-gray-900 dark:border-gray-700 shadow-md">
      <div className="container mx-auto flex md:justify-between  p-5 flex-col md:flex-row items-center">
        <Link href="/" className="flex title-font font-medium items-center text-gray-900 dark:text-white mb-4 md:mb-0">
         <Image width={32} height={32} alt='' src={"/logo.png"}/>
          <span className="ml-3 text-xl">Mushibe.az</span>
        </Link>
        <nav>
        <SocialMediLinks  />
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
