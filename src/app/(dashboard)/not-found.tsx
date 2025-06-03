import React from 'react'

// app/not-found.tsx

export default function NotFound() {
  return (
    <main className="grid min-h-full place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-xl font-semibold text-indigo-600">404</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-titleText sm:text-7xl">
          Səhifə tapılmadı
        </h1>
        <p className="mt-6 text-lg text-contentText sm:text-xl">
          Bağışlayın, axtardığınız səhifə mövcud deyil və ya köçürülmüşdür.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
        </div>
      </div>
    </main>
  );
}

