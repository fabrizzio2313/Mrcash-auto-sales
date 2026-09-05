"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";

/**
 * Interactive photo manager for the vehicle admin form. Keeps its own list
 * of photo URLs (existing photos + newly uploaded/added ones) and mirrors it
 * into a hidden `photos` textarea-equivalent input (newline-separated),
 * which is exactly the format lib/actions/vehicles.ts already expects — so
 * deleting/reordering/uploading here needs no Server Action changes at all:
 * on save, the vehicle's photos are deleted and recreated from this list, in
 * this order. The first photo is always the "cover"/primary photo, matching
 * how VehicleCard and the vehicle detail page already pick `photos[0]`.
 */
export default function PhotoManager({ initialUrls }: { initialUrls: string[] }) {
  const t = useTranslations("admin.form");
  const [photos, setPhotos] = useState<string[]>(initialUrls);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addUrl() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setPhotos((prev) => [...prev, trimmed]);
    setUrlInput("");
  }

  function removeAt(index: number) {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  }

  function moveUp(index: number) {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  }

  function moveDown(index: number) {
    setPhotos((prev) => {
      if (index === prev.length - 1) return prev;
      const next = [...prev];
      [next[index + 1], next[index]] = [next[index], next[index + 1]];
      return next;
    });
  }

  function makePrimary(index: number) {
    if (index === 0) return;
    setPhotos((prev) => {
      const next = [...prev];
      const [item] = next.splice(index, 1);
      next.unshift(item);
      return next;
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(data.error || "Upload failed.");
        }
        setPhotos((prev) => [...prev, data.url as string]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="sm:col-span-2">
      <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {t("photos")}
      </label>

      {photos.length > 0 && (
        <div className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="relative rounded-lg border border-slate-200 p-1.5 dark:border-slate-700"
            >
              {index === 0 && (
                <span className="absolute left-2 top-2 z-10 rounded-full bg-amber-400 px-2 py-0.5 text-[10px] font-bold text-slate-900">
                  {t("primaryPhoto")}
                </span>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt="" className="aspect-square w-full rounded object-cover" />

              <div className="mt-1.5 flex items-center justify-between gap-1">
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0}
                    aria-label={t("moveUp")}
                    className="rounded p-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    &uarr;
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === photos.length - 1}
                    aria-label={t("moveDown")}
                    className="rounded p-2 text-sm text-slate-600 hover:bg-slate-100 disabled:opacity-30 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    &darr;
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => removeAt(index)}
                  className="rounded p-2 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  {t("removePhoto")}
                </button>
              </div>
              {index !== 0 && (
                <button
                  type="button"
                  onClick={() => makePrimary(index)}
                  className="mt-1 min-h-9 w-full rounded p-1 text-[11px] font-medium text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                >
                  {t("makePrimary")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addUrl();
            }
          }}
          placeholder="https://example.com/photo.jpg"
          className="min-h-11 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        <button
          type="button"
          onClick={addUrl}
          className="min-h-11 rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("addPhotoUrl")}
        </button>
      </div>

      <div className="mt-2">
        <label className="flex min-h-11 w-fit cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800">
          {uploading ? t("uploading") : t("uploadFromDevice")}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            multiple
            disabled={uploading}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </label>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <input type="hidden" name="photos" value={photos.join("\n")} />
    </div>
  );
}
