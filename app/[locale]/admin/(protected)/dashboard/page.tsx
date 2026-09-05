import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import { getVehicleStats } from "@/lib/vehicles";
import StatCard from "@/components/admin/StatCard";

export default async function AdminDashboardPage() {
  const t = await getTranslations("admin.dashboard");
  const session = await getSession();
  const stats = await getVehicleStats();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        {t("welcome", { name: session?.name ?? "" })}
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard label={t("totalVehicles")} value={stats.total} />
        <StatCard label={t("available")} value={stats.available} />
        <StatCard label={t("sold")} value={stats.sold} />
        <StatCard label={t("newMessages")} value={stats.newLeads} />
        <StatCard label={t("pendingReviews")} value={stats.pendingReviews} />
      </div>
    </div>
  );
}
