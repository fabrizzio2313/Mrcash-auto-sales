import { getTranslations } from "next-intl/server";

// Plain HTML GET form — no client JS needed. Submitting navigates to
// /admin/messages?search=...&type=...&status=... which the server
// component reads back out of `searchParams`.
export default async function LeadFilters({
  defaults,
}: {
  defaults: { search?: string; type?: string; status?: string };
}) {
  const t = await getTranslations("admin.messages");

  return (
    <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-4">
      <input
        type="search"
        name="search"
        defaultValue={defaults.search}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 sm:col-span-2"
      />

      <select
        name="type"
        defaultValue={defaults.type ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("allTypes")}</option>
        <option value="TEST_DRIVE">{t("type.TEST_DRIVE")}</option>
        <option value="FINANCING">{t("type.FINANCING")}</option>
        <option value="GENERAL_INQUIRY">{t("type.GENERAL_INQUIRY")}</option>
      </select>

      <select
        name="status"
        defaultValue={defaults.status ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("allStatuses")}</option>
        <option value="NEW">{t("status.NEW")}</option>
        <option value="CONTACTED">{t("status.CONTACTED")}</option>
        <option value="CLOSED">{t("status.CLOSED")}</option>
      </select>

      <button
        type="submit"
        className="col-span-full min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:col-span-1"
      >
        {t("applyFilters")}
      </button>
    </form>
  );
}
