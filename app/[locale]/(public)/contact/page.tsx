import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import ContactForm from "@/components/ContactForm";
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
    title: t("contact.title"),
    description: t("contact.description"),
    alternates: buildAlternates(locale, "/contact"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations("contact");
  const tAbout = await getTranslations("about");
  const site = await getSite();

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800">
            <iframe
              title={t("title")}
              src={site.mapEmbedSrc}
              className="h-64 w-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <p className="font-semibold text-slate-900 dark:text-white">{t("address")}</p>
            <p className="mt-1">
              {site.address.line1}, {site.address.line2}
            </p>
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">{t("phoneLabel")}</p>
            <p className="mt-1">{site.phoneDisplay}</p>
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">{t("emailLabel")}</p>
            <p className="mt-1">{site.email}</p>
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">{tAbout("hoursTitle")}</p>
            <p className="mt-1">
              {tAbout("mondayFriday")}: {site.hours.mondayFriday}
            </p>
            <p>
              {tAbout("saturday")}: {site.hours.saturday}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
