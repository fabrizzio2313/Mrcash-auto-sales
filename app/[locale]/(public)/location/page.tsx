import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { getSite } from "@/lib/settings";
import { MapPinIcon } from "@/components/icons";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("location.title"),
    description: t("location.description"),
    alternates: buildAlternates(locale, "/location"),
  };
}

export default async function LocationPage() {
  const t = await getTranslations("location");
  const tAbout = await getTranslations("about");
  const site = await getSite();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
          <iframe
            title={t("title")}
            src={site.mapEmbedSrc}
            className="h-80 w-full lg:h-full"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-white">
              <MapPinIcon className="h-5 w-5 text-blue-600" />
              {t("addressTitle")}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {site.address.line1}
              <br />
              {site.address.line2}
            </p>
            <a
              href={site.mapLinkHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-block text-sm font-medium text-blue-600 hover:underline"
            >
              {t("getDirections")} &rarr;
            </a>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">{tAbout("hoursTitle")}</h2>
            <dl className="mt-3 space-y-1 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <dt>{tAbout("mondayFriday")}</dt>
                <dd>{site.hours.mondayFriday}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{tAbout("saturday")}</dt>
                <dd>{site.hours.saturday}</dd>
              </div>
              <div className="flex justify-between">
                <dt>{tAbout("sunday")}</dt>
                <dd>{site.hours.sunday}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl bg-[#0b1a33] p-6">
            <h2 className="font-semibold text-white">{t("directionsTitle")}</h2>
            <p className="mt-2 text-sm text-slate-300">{t("directionsBody")}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
