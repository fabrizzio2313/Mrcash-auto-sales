import { useTranslations } from "next-intl";
import type { VehicleStatus } from "@/lib/generated/prisma/client";

const STYLES: Record<VehicleStatus, string> = {
  AVAILABLE:
    "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  PENDING:
    "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  SOLD: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

const LABEL_KEY: Record<VehicleStatus, string> = {
  AVAILABLE: "statusAvailable",
  PENDING: "statusPending",
  SOLD: "statusSold",
};

export default function StatusBadge({ status }: { status: VehicleStatus }) {
  const t = useTranslations("vehicle");

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${STYLES[status]}`}
    >
      {t(LABEL_KEY[status])}
    </span>
  );
}
