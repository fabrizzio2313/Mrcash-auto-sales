import { getTranslations } from "next-intl/server";

const YEAR_OPTIONS = [2024, 2022, 2020, 2018, 2015, 2010];
const PRICE_MAX_OPTIONS = [10000, 15000, 20000, 25000, 30000, 40000, 50000];
const MILEAGE_MAX_OPTIONS = [30000, 50000, 75000, 100000, 150000];

// Plain HTML GET form — no client JS needed. Submitting navigates to
// /inventory?search=...&make=...&model=...&yearMin=...&priceMax=...
// &mileageMax=...&status=...&sort=... which the server component reads
// back out of `searchParams`.
export default async function InventoryFilters({
  makes,
  models,
  defaults,
}: {
  makes: string[];
  models: string[];
  defaults: {
    search?: string;
    make?: string;
    model?: string;
    yearMin?: string;
    priceMax?: string;
    mileageMax?: string;
    status?: string;
    sort?: string;
  };
}) {
  const t = await getTranslations("inventory");
  const tVehicle = await getTranslations("vehicle");

  return (
    <form className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:grid-cols-2 lg:grid-cols-4">
      <input
        type="search"
        name="search"
        defaultValue={defaults.search}
        placeholder={t("searchPlaceholder")}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2"
      />

      <select
        name="make"
        defaultValue={defaults.make ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("allMakes")}</option>
        {makes.map((make) => (
          <option key={make} value={make}>
            {make}
          </option>
        ))}
      </select>

      <select
        name="model"
        defaultValue={defaults.model ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("allModels")}</option>
        {models.map((model) => (
          <option key={model} value={model}>
            {model}
          </option>
        ))}
      </select>

      <select
        name="yearMin"
        defaultValue={defaults.yearMin ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("anyYear")}</option>
        {YEAR_OPTIONS.map((year) => (
          <option key={year} value={year}>
            {year}+
          </option>
        ))}
      </select>

      <select
        name="priceMax"
        defaultValue={defaults.priceMax ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("anyPrice")}</option>
        {PRICE_MAX_OPTIONS.map((price) => (
          <option key={price} value={price}>
            {t("underPrice", { price: price.toLocaleString() })}
          </option>
        ))}
      </select>

      <select
        name="mileageMax"
        defaultValue={defaults.mileageMax ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("anyMileage")}</option>
        {MILEAGE_MAX_OPTIONS.map((mileage) => (
          <option key={mileage} value={mileage}>
            {t("underMileage", { mileage: mileage.toLocaleString() })}
          </option>
        ))}
      </select>

      <select
        name="status"
        defaultValue={defaults.status ?? ""}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="">{t("allStatuses")}</option>
        <option value="AVAILABLE">{tVehicle("statusAvailable")}</option>
        <option value="PENDING">{tVehicle("statusPending")}</option>
        <option value="SOLD">{tVehicle("statusSold")}</option>
      </select>

      <select
        name="sort"
        defaultValue={defaults.sort ?? "newest"}
        className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="price-asc">{t("sortPriceAsc")}</option>
        <option value="price-desc">{t("sortPriceDesc")}</option>
      </select>

      <button
        type="submit"
        className="col-span-full min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200 sm:col-span-1"
      >
        {t("apply")}
      </button>
    </form>
  );
}
