import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VehicleTable from "@/components/admin/VehicleTable";
import { getVehicles } from "@/lib/vehicles";

export default async function AdminVehiclesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.vehicles");
  const vehicles = await getVehicles({ sort: "newest" });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
        <Link
          href="/admin/vehicles/new"
          className="inline-flex min-h-11 items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          {t("addNew")}
        </Link>
      </div>

      <div className="mt-6">
        <VehicleTable vehicles={vehicles} locale={locale} />
      </div>
    </div>
  );
}
