"use client";

import { useState } from "react";
import type { Photo } from "@/lib/generated/prisma/client";

export default function PhotoGallery({
  photos,
  alt,
  onSaleLabel,
}: {
  photos: Photo[];
  alt: string;
  onSaleLabel?: string;
}) {
  const [active, setActive] = useState(0);
  const cover = photos[active];

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={cover.url} alt={alt} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-400">
            No photo
          </div>
        )}
        {onSaleLabel && (
          <span className="absolute left-3 top-3 inline-flex items-center rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-slate-900">
            {onSaleLabel}
          </span>
        )}
      </div>

      {photos.length > 1 && (
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => setActive(index)}
              aria-current={index === active}
              aria-label={`Photo ${index + 1}`}
              className={`aspect-square overflow-hidden rounded-lg border-2 ${
                index === active
                  ? "border-blue-600"
                  : "border-transparent hover:border-slate-300 dark:hover:border-slate-600"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
