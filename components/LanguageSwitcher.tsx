"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { en: "EN", es: "ES" };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1 rounded-full border border-slate-600 p-0.5 text-sm">
      {routing.locales.map((loc) => (
        <button
          key={loc}
          type="button"
          onClick={() => router.replace(pathname, { locale: loc })}
          aria-current={loc === locale}
          className={`rounded-full px-3 py-1.5 font-medium transition-colors ${
            loc === locale
              ? "bg-amber-400 text-slate-900"
              : "text-slate-200 hover:bg-white/10"
          }`}
        >
          {LABELS[loc] ?? loc}
        </button>
      ))}
    </div>
  );
}
