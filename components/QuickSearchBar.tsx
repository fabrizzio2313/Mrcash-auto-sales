import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { SearchIcon } from "@/components/icons";

// Plain HTML GET form (no client JS) that hands off straight to
// /inventory?search=...&make=...&priceMax=... — same pattern as
// components/InventoryFilters.tsx, just a smaller subset of fields.
export default async function QuickSearchBar({ makes }: { makes: string[] }) {
  const t = await getTranslations("home");
  const tInv = await getTranslations("inventory");

  return (
    <form
      action="/inventory"
      className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/5 dark:bg-slate-900 sm:grid-cols-4 sm:p-5"
    >
      <input
        type="search"
        name="search"
        placeholder={tInv("searchPlaceholder")}
        className="min-h-11 rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 sm:col-span-2"
      />

      <select
        name="make"
        defaultValue=""
        className="min-h-11 rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{tInv("allMakes")}</option>
        {makes.map((make) => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
      </select>

      <button
        type="submit"
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500"
      >
        <SearchIcon className="h-4 w-4" />
        {t("quickSearchButton")}
      </button>

      <div className="sm:col-span-4">
        <Link href="/inventory" className="text-xs font-medium text-blue-600 hover:underline">
          {t("viewAll")} &rarr;
        </Link>
      </div>
    </form>
  );
}
