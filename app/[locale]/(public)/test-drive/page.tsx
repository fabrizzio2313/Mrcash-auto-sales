import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import TestDriveForm from "@/components/TestDriveForm";
import { getAvailableVehicles } from "@/lib/vehicles";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("testDrive.title"),
    description: t("testDrive.description"),
    alternates: buildAlternates(locale, "/test-drive"),
  };
}

export default async function TestDrivePage({
  searchParams,
}: {
  searchParams: Promise<{ vehicleId?: string }>;
}) {
  const { vehicleId } = await searchParams;
  const t = await getTranslations("testDrive");
  const vehicles = await getAvailableVehicles();

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <TestDriveForm vehicles={vehicles} vehicleId={vehicleId} />
      </div>
    </div>
  );
}
