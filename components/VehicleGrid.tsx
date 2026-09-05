import { useTranslations } from "next-intl";
import VehicleCard from "@/components/VehicleCard";
import type { Vehicle, Photo } from "@/lib/generated/prisma/client";

type VehicleWithPhotos = Vehicle & { photos: Photo[] };

export default function VehicleGrid({
  vehicles,
}: {
  vehicles: VehicleWithPhotos[];
}) {
  const t = useTranslations("inventory");

  if (vehicles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {t("noResults")}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {vehicles.map((vehicle) => (
        <VehicleCard key={vehicle.id} vehicle={vehicle} />
      ))}
    </div>
  );
}
