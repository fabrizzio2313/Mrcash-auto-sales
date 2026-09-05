import { getTranslations } from "next-intl/server";
import VehicleForm from "@/components/admin/VehicleForm";
import { createVehicle } from "@/lib/actions/vehicles";

export default async function NewVehiclePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.form");
  const createWithLocale = createVehicle.bind(null, locale);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("newTitle")}</h1>
      <div className="mt-6 max-w-3xl">
        <VehicleForm action={createWithLocale} />
      </div>
    </div>
  );
}
