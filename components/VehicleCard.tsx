import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/StatusBadge";
import type { Vehicle, Photo } from "@/lib/generated/prisma/client";

type VehicleWithPhotos = Vehicle & { photos: Photo[] };

export default function VehicleCard({ vehicle }: { vehicle: VehicleWithPhotos }) {
  const t = useTranslations("vehicle");
  const cover = vehicle.photos[0]?.url;

  return (
    <Link
      href={`/inventory/${vehicle.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-[translate,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl hover:shadow-slate-900/10 motion-reduce:transition-none motion-reduce:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/40"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        {cover ? (
          // Vehicle photos are arbitrary admin-entered URLs (any host), so we use a
          // plain <img> instead of next/image, which requires an allowlisted host.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
            className="h-full w-full object-cover transition-[scale] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-400">
            No photo
          </div>
        )}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          <StatusBadge status={vehicle.status} />
          {vehicle.onSale && (
            <span className="inline-flex w-fit items-center rounded-full bg-amber-400 px-2.5 py-1 text-xs font-bold text-slate-900">
              {t("onSale")}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">
          {vehicle.year} {vehicle.make} {vehicle.model}
          {vehicle.trim ? ` ${vehicle.trim}` : ""}
        </h3>
        <div className="flex items-baseline gap-2">
          <p className="text-lg font-bold text-blue-600">
            ${vehicle.price.toLocaleString()}
          </p>
          {vehicle.onSale && vehicle.originalPrice && (
            <p className="text-sm text-slate-400 line-through">
              ${vehicle.originalPrice.toLocaleString()}
            </p>
          )}
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {vehicle.mileage.toLocaleString()} {t("miles")}
        </p>
      </div>
    </Link>
  );
}
