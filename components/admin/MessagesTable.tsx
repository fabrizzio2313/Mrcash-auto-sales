import { getTranslations } from "next-intl/server";
import { updateLeadStatus } from "@/lib/actions/leads";
import type { Lead, Vehicle } from "@/lib/generated/prisma/client";

type LeadWithVehicle = Lead & { vehicle: Vehicle | null };

const STATUS_STYLES: Record<Lead["status"], string> = {
  NEW: "border-blue-300 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20",
  CONTACTED: "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
  CLOSED: "border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-900",
};

const ALL_STATUSES: Lead["status"][] = ["NEW", "CONTACTED", "CLOSED"];

export default async function MessagesTable({
  leads,
  locale,
}: {
  leads: LeadWithVehicle[];
  locale: string;
}) {
  const t = await getTranslations("admin.messages");

  if (leads.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {t("noMessages")}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {leads.map((lead) => (
        <li key={lead.id} className={`rounded-xl border p-4 ${STATUS_STYLES[lead.status]}`}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold break-words text-slate-900 dark:text-white">
                {t("from")}: {lead.name} &lt;{lead.email}&gt;
              </p>
              {lead.phone && (
                <p className="text-sm text-slate-500 dark:text-slate-400">{lead.phone}</p>
              )}
              {lead.vehicle && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {t("about")}: {lead.vehicle.year} {lead.vehicle.make} {lead.vehicle.model}
                </p>
              )}
            </div>
            <div className="flex flex-col items-end gap-1 text-right">
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {t(`type.${lead.type}`)}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(lead.createdAt).toLocaleString()}
              </span>
            </div>
          </div>

          {lead.preferredDate && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {new Date(lead.preferredDate).toLocaleDateString()}
            </p>
          )}
          {lead.message && (
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
              {lead.message}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {t("setStatus")}
            </span>
            {ALL_STATUSES.map((status) => {
              const isCurrent = status === lead.status;
              if (isCurrent) {
                return (
                  <span
                    key={status}
                    className="inline-flex min-h-9 items-center rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white dark:bg-white dark:text-slate-900"
                  >
                    {t(`status.${status}`)}
                  </span>
                );
              }
              const setStatus = updateLeadStatus.bind(null, locale, lead.id, status);
              return (
                <form key={status} action={setStatus}>
                  <button
                    type="submit"
                    className="min-h-9 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {t(`status.${status}`)}
                  </button>
                </form>
              );
            })}
          </div>
        </li>
      ))}
    </ul>
  );
}
