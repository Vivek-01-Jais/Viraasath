"use client"

import Image from "next/image"

type GalleryImage = { id: string; url: string; alt_text: string | null }

export function ProductGallery({ images, name }: { images: GalleryImage[]; name: string }) {
  if (images.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-4">
      {images.slice(0, 4).map((img, i) => (
        <div key={img.id} className={`overflow-hidden rounded-xl bg-[#F5F0EB] dark:bg-[#242424] ${i === 0 ? "col-span-2" : ""}`}>
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
        </div>
      ))}
    </div>
  )
}
