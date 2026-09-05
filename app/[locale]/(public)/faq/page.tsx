import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { buildAlternates } from "@/lib/seo";

const QUESTION_KEYS = ["financing", "tradeIn", "inspected", "warranty", "testDrive", "documents"] as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("faq.title"),
    description: t("faq.description"),
    alternates: buildAlternates(locale, "/faq"),
  };
}

export default async function FaqPage() {
  const t = await getTranslations("faq");

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-8 flex flex-col gap-3">
        {QUESTION_KEYS.map((key) => (
          <details
            key={key}
            className="group rounded-xl border border-slate-200 bg-white p-5 open:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-slate-900 dark:text-white">
              {t(`${key}Q`)}
              <span className="ml-4 shrink-0 text-slate-400 transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">{t(`${key}A`)}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
