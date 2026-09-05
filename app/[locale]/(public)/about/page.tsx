import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSite } from "@/lib/settings";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("about.title"),
    description: t("about.description"),
    alternates: buildAlternates(locale, "/about"),
  };
}

export default async function AboutPage() {
  const t = await getTranslations("about");
  const site = await getSite();

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-6 text-slate-700 dark:text-slate-300">{t("body1")}</p>
      <p className="mt-4 text-slate-700 dark:text-slate-300">{t("body2")}</p>

      <div className="mt-10 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">{t("hoursTitle")}</h2>
        <dl className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
          <div className="flex justify-between">
            <dt>{t("mondayFriday")}</dt>
            <dd>{site.hours.mondayFriday}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("saturday")}</dt>
            <dd>{site.hours.saturday}</dd>
          </div>
          <div className="flex justify-between">
            <dt>{t("sunday")}</dt>
            <dd>{site.hours.sunday}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
