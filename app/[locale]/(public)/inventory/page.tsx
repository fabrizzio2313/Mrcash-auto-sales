import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import VehicleGrid from "@/components/VehicleGrid";
import InventoryFilters from "@/components/InventoryFilters";
import { getVehicles, getDistinctMakes, getDistinctModels } from "@/lib/vehicles";
import type { VehicleFilters } from "@/lib/vehicles";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("inventory.title"),
    description: t("inventory.description"),
    alternates: buildAlternates(locale, "/inventory"),
  };
}

export default async function InventoryPage({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    make?: string;
    model?: string;
    yearMin?: string;
    priceMax?: string;
    mileageMax?: string;
    status?: string;
    sort?: string;
  }>;
}) {
  const params = await searchParams;
  const t = await getTranslations("inventory");

  const filters: VehicleFilters = {
    search: params.search || undefined,
    make: params.make || undefined,
    model: params.model || undefined,
    yearMin: params.yearMin ? Number(params.yearMin) : undefined,
    priceMax: params.priceMax ? Number(params.priceMax) : undefined,
    mileageMax: params.mileageMax ? Number(params.mileageMax) : undefined,
    status: (params.status as VehicleFilters["status"]) || undefined,
    sort: (params.sort as VehicleFilters["sort"]) || "newest",
  };

  const [vehicles, makes, models] = await Promise.all([
    getVehicles(filters),
    getDistinctMakes(),
    getDistinctModels(params.make),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-6">
        <InventoryFilters makes={makes} models={models} defaults={params} />
      </div>

      <p className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        {t("resultsCount", { count: vehicles.length })}
      </p>

      <div className="mt-4">
        <VehicleGrid vehicles={vehicles} />
      </div>
    </div>
  );
}
