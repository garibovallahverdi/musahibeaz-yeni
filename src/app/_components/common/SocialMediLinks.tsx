import Image from 'next/image';
import React from 'react';

const SocialMediLinks = () => {
  return (
          <div className="flex items-center space-x-4 self-end  lg:w-auto px-4 py-2 rounded-lg">
                    <Image
                      width={32}
                      height={32}
                      src="/social/facebook.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                    <Image
                      width={32}
                      height={32}
                      src="/social/instagram.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                    <Image
                      width={32}
                      height={32}
                      src="/social/youtube.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                    <Image
                      width={32}
                      height={32}
                      src="/social/linkedin.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                    <Image
                      width={32}
                      height={32}
                      src="/social/telegram.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                    <Image
                      width={32}
                      height={32}
                      src="/social/whatsapp.svg"
                      alt="Logo"
                      className="h-6 w-6 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                    />
                  </div>
  );
}

export default SocialMediLinks;
