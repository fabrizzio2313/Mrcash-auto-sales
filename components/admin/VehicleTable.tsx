import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/StatusBadge";
import { deleteVehicle } from "@/lib/actions/vehicles";
import ConfirmForm from "@/components/admin/ConfirmForm";
import type { Vehicle } from "@/lib/generated/prisma/client";

export default async function VehicleTable({
  vehicles,
  locale,
}: {
  vehicles: Vehicle[];
  locale: string;
}) {
  const t = await getTranslations("admin.vehicles");

  if (vehicles.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {t("noVehicles")}
      </p>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards — a horizontally scrolling table is awkward to
          use on a phone, so below `sm` each vehicle is its own card. */}
      <ul className="flex flex-col gap-3 sm:hidden">
        {vehicles.map((vehicle) => {
          const deleteWithArgs = deleteVehicle.bind(null, locale, vehicle.id);
          return (
            <li
              key={vehicle.id}
              className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="font-medium text-slate-900 dark:text-white">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                  {vehicle.featured ? " ★" : ""}
                </p>
                <StatusBadge status={vehicle.status} />
              </div>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">
                ${vehicle.price.toLocaleString()}
              </p>
              <div className="mt-3 flex gap-2">
                <Link
                  href={`/admin/vehicles/${vehicle.id}/edit`}
                  className="flex min-h-11 flex-1 items-center justify-center rounded-lg border border-slate-300 px-3 text-sm font-medium text-blue-600 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-900"
                >
                  {t("edit")}
                </Link>
                <ConfirmForm
                  action={deleteWithArgs}
                  confirmMessage={t("confirmDelete")}
                  className="flex-1"
                >
                  <button
                    type="submit"
                    className="min-h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-slate-700 dark:hover:bg-red-900/20"
                  >
                    {t("delete")}
                  </button>
                </ConfirmForm>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop: table */}
      <div className="hidden overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 sm:block">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">{t("table.vehicle")}</th>
              <th className="px-4 py-3">{t("table.price")}</th>
              <th className="px-4 py-3">{t("table.status")}</th>
              <th className="px-4 py-3">{t("table.featured")}</th>
              <th className="px-4 py-3 text-right">{t("table.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {vehicles.map((vehicle) => {
              const deleteWithArgs = deleteVehicle.bind(null, locale, vehicle.id);
              return (
                <tr key={vehicle.id} className="bg-white dark:bg-slate-950">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {vehicle.year} {vehicle.make} {vehicle.model}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    ${vehicle.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={vehicle.status} />
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {vehicle.featured ? "★" : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/vehicles/${vehicle.id}/edit`}
                        className="font-medium text-blue-600 hover:underline"
                      >
                        {t("edit")}
                      </Link>
                      <ConfirmForm action={deleteWithArgs} confirmMessage={t("confirmDelete")}>
                        <button type="submit" className="font-medium text-red-600 hover:underline">
                          {t("delete")}
                        </button>
                      </ConfirmForm>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
