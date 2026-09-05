"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  WhatsAppIcon,
  FacebookIcon,
  LinkIcon,
  CheckIcon,
  ShareIcon,
} from "@/components/icons";

/**
 * Share controls for a single vehicle: WhatsApp, Facebook, and copy-link.
 * `url` must be the absolute, public URL of the vehicle detail page (the
 * same one used for the canonical/OpenGraph tags, so Facebook scrapes the
 * right preview).
 */
export default function ShareButtons({
  url,
  title,
}: {
  url: string;
  title: string;
}) {
  const t = useTranslations("vehicle");
  const [copied, setCopied] = useState(false);

  const message = t("shareText", { title });
  const whatsappHref = `https://wa.me/?text=${encodeURIComponent(`${message} ${url}`)}`;
  const facebookHref = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Fallback for older browsers or non-HTTPS contexts where the
      // Clipboard API is unavailable.
      const input = document.createElement("input");
      input.value = url;
      input.setAttribute("readonly", "");
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      try {
        document.execCommand("copy");
      } catch {
        /* nothing else we can do */
      }
      document.body.removeChild(input);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  const base =
    "flex min-h-11 grow items-center justify-center gap-2 rounded-lg border px-3.5 py-2 text-sm font-medium transition-colors sm:grow-0";

  return (
    <div className="mt-5">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <ShareIcon className="h-4 w-4" />
        {t("shareTitle")}
      </p>
      <div className="flex flex-wrap gap-2">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} border-green-600/30 bg-green-50 text-green-700 hover:bg-green-100 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300 dark:hover:bg-green-500/20`}
        >
          <WhatsAppIcon className="h-4 w-4 shrink-0" />
          WhatsApp
        </a>
        <a
          href={facebookHref}
          target="_blank"
          rel="noopener noreferrer"
          className={`${base} border-blue-600/30 bg-blue-50 text-blue-700 hover:bg-blue-100 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20`}
        >
          <FacebookIcon className="h-4 w-4 shrink-0" />
          Facebook
        </a>
        <button
          type="button"
          onClick={copyLink}
          aria-live="polite"
          className={`${base} ${
            copied
              ? "border-green-600/30 bg-green-50 text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
              : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          }`}
        >
          {copied ? (
            <CheckIcon className="h-4 w-4 shrink-0" />
          ) : (
            <LinkIcon className="h-4 w-4 shrink-0" />
          )}
          {copied ? t("shareCopied") : t("shareCopyLink")}
        </button>
      </div>
    </div>
  );
}
