'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'

interface Props {
  images: string[]
}

export default function ImageGallery({ images }: Props) {
  const [open, setOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const openModal = (index: number) => {
    setCurrentIndex(index)
    setOpen(true)
  }

  const closeModal = () => setOpen(false)

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const showPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal()
      if (e.key === 'ArrowRight') showNext()
      if (e.key === 'ArrowLeft') showPrev()
    }

    if (open) {
      window.addEventListener('keydown', handleKey)
    }

    return () => window.removeEventListener('keydown', handleKey)
  }, [open])

  return (
    <>
      {/* Gallery */}
      <div className='flex flex-col my-5'>
        <h3 className='text-xl font-semibold my-2'>Galerya</h3>
      <div className="grid gap-2 sm:gap-3  grid-cols-[repeat(auto-fill,minmax(80px,1fr))]  max-h-[50vh] overflow-x-auto">
        {images.map((src, i) => (
            <Image
            key={i}
            src={src}
            alt={`image-${i}`}
            loading="lazy" // Lazy loading
            onClick={() => openModal(i)}
            width={80}
            height={80}
            className="h-[80px] w-full object-cover rounded cursor-pointer"
            />
        ))}
      </div>
        </div>

      {/* Modal */}
      {open && (
        <div
          onClick={closeModal}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[9999] p-5"
        >
          {/* Kapat Butonu */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setOpen(false)
            }}
            className="absolute top-5 right-5 text-white text-3xl bg-transparent border-none cursor-pointer"
            aria-label="Kapat"
          >
            ✕
          </button>

          {/* Önceki Buton */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              showPrev()
            }}
            className="absolute left-3 text-white text-4xl bg-transparent border-none cursor-pointer p-2"
            aria-label="Önceki"
          >
            ‹
          </button>

          {/* Görsel */}
          <div className="max-h-[90vh] overflow-y-auto flex items-center justify-center">
            {images[currentIndex] && (
              <Image
                src={images[currentIndex]}
                alt={`slider-${currentIndex}`}
                loading="lazy"
                onClick={(e) => e.stopPropagation()}
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              />
            )}
          </div>

          {/* Sonraki Buton */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              showNext()
            }}
            className="absolute right-3 text-white text-4xl bg-transparent border-none cursor-pointer p-2"
            aria-label="Sonraki"
          >
            ›
          </button>
        </div>
      )}
    </>
  )
}
