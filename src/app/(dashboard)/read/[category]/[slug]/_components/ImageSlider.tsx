// // components/ImageSlider.tsx (Önceki Tailwind CSS'li sürümden kopyalayabilirsiniz)
// import { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';

// interface ImageSliderProps {
//   images: string[]; // Sadece URL'lerden oluşan bir string dizisi
//   startIndex: number;
//   onClose: () => void;
// }

// const ImageSlider: React.FC<ImageSliderProps> = ({ images, startIndex, onClose }) => {
//   const [currentIndex, setCurrentIndex] = useState(startIndex);

//   const handleKeyDown = useCallback((e: KeyboardEvent) => {
//     if (e.key === 'Escape') {
//       onClose();
//     } else if (e.key === 'ArrowLeft') {
//       prevImage();
//     } else if (e.key === 'ArrowRight') {
//       nextImage();
//     }
//   }, [onClose]);

//   useEffect(() => {
//     document.addEventListener('keydown', handleKeyDown);
//     return () => {
//       document.removeEventListener('keydown', handleKeyDown);
//     };
//   }, [handleKeyDown]);

//   const nextImage = () => {
//     setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
//   };

//   const prevImage = () => {
//     setCurrentIndex((prevIndex) =>
//       prevIndex === 0 ? images.length - 1 : prevIndex - 1
//     );
//   };

//   return (
//     <div
//       className="fixed inset-0 bg-black bg-opacity-90 backdrop-blur-md flex justify-center items-center z-50 animate-fadeIn"
//       onClick={onClose}
//     >
//       <div
//         className="relative w-11/12 max-w-4xl h-[85vh] bg-black rounded-lg flex justify-center items-center shadow-2xl overflow-hidden"
//         onClick={(e) => e.stopPropagation()}
//       >
//         <Image
//           src={images[currentIndex]} // Doğrudan URL kullanılıyor
//           alt={`Slider Image ${currentIndex + 1}`} // Varsayılan alt metin
//           layout="fill"
//           objectFit="contain"
//           className="rounded-lg"
//         />

//         <button
//           className="absolute left-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full text-3xl cursor-pointer
//                      hover:bg-opacity-80 hover:scale-105 transition-all duration-200 z-10"
//           onClick={prevImage}
//         >
//           &lt;
//         </button>
//         <button
//           className="absolute right-4 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-4 rounded-full text-3xl cursor-pointer
//                      hover:bg-opacity-80 hover:scale-105 transition-all duration-200 z-10"
//           onClick={nextImage}
//         >
//           &gt;
//         </button>

//         <button
//           className="absolute top-4 right-4 bg-white bg-opacity-20 text-white rounded-full w-10 h-10 text-3xl flex justify-center items-center cursor-pointer
//                      hover:bg-opacity-40 hover:rotate-90 transition-all duration-300 z-10"
//           onClick={onClose}
//         >
//           &times;
//         </button>
//       </div>

//       <style jsx>{`
//         @keyframes fadeIn {
//           from { opacity: 0; }
//           to { opacity: 1; }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.3s ease-out forwards;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default ImageSlider;