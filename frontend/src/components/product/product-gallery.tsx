"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

type GalleryImage = { id: string; url: string; alt_text: string | null }

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const close = useCallback(() => setSelectedIndex(null), [])

  useEffect(() => {
    if (selectedIndex === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close()
      if (e.key === "ArrowLeft") setSelectedIndex(i => i !== null ? (i - 1 + images.length) % images.length : null)
      if (e.key === "ArrowRight") setSelectedIndex(i => i !== null ? (i + 1) % images.length : null)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [selectedIndex, images.length, close])

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        {images.slice(0, 4).map((img, i) => (
          <button
            key={img.id}
            onClick={() => setSelectedIndex(i)}
            className={`overflow-hidden rounded-xl bg-[#F5F0EB] dark:bg-[#242424] text-left cursor-pointer ${i === 0 ? "col-span-2" : ""}`}
          >
            <Image
              src={img.url}
              alt={img.alt_text ?? name}
              width={400}
              height={500}
              className="w-full aspect-[4/5] object-cover hover:scale-105 transition-transform duration-700"
              sizes="(max-width: 768px) 100vw, 50vw"
              onError={(e) => {
                const target = e.currentTarget as HTMLElement
                target.style.display = "none"
              }}
            />
          </button>
        ))}
      </div>

      {selectedIndex !== null && (
        <div
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center"
          onClick={close}
        >
          <button
            onClick={close}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white z-10"
            aria-label="Close zoom"
          >
            <X className="w-6 h-6" />
          </button>

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex - 1 + images.length) % images.length) }}
                className="absolute left-4 p-2 text-white/80 hover:text-white z-10"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setSelectedIndex((selectedIndex + 1) % images.length) }}
                className="absolute right-16 p-2 text-white/80 hover:text-white z-10"
                aria-label="Next image"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </>
          )}

          <div className="relative max-w-[90vw] max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[selectedIndex].url}
              alt={images[selectedIndex].alt_text ?? name}
              width={900}
              height={1200}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              sizes="90vw"
              priority
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-6 flex items-center gap-2">
              {images.slice(0, 4).map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedIndex(i)}
                  className={`w-14 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    i === selectedIndex ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    width={56}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
