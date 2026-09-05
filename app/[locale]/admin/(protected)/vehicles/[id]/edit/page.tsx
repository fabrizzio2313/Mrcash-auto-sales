import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import VehicleForm from "@/components/admin/VehicleForm";
import { updateVehicle } from "@/lib/actions/vehicles";
import { getVehicleById } from "@/lib/vehicles";

export default async function EditVehiclePage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id, locale } = await params;
  const t = await getTranslations("admin.form");
  const vehicle = await getVehicleById(id);

  if (!vehicle) notFound();

  const updateWithArgs = updateVehicle.bind(null, locale, id);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("editTitle")}</h1>
      <div className="mt-6 max-w-3xl">
        <VehicleForm action={updateWithArgs} vehicle={vehicle} />
      </div>
    </div>
  );
}
