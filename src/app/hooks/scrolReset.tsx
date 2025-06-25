"use client";
import { useEffect } from 'react';

const ScrollReset = () => {
  useEffect(() => {
    const sidebar = document.getElementById('sidebar');

    const handleScroll = () => {
      // Sayfa en tepeye gelince sidebar içindeki scroll'u sıfırla
      if (window.scrollY <= 0 && sidebar) {
        sidebar.scrollTo({ top: 0, behavior: 'auto' });
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return null;
};

export default ScrollReset;