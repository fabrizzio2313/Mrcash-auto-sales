import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { logout } from "@/lib/actions/auth";

export default async function AdminSidebar({ locale }: { locale: string }) {
  const t = await getTranslations("admin.nav");
  const logoutWithLocale = logout.bind(null, locale);

  return (
    <aside className="flex w-full shrink-0 flex-col gap-1 border-b border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 sm:h-screen sm:w-56 sm:border-b-0 sm:border-r">
      <p className="mb-4 px-2 text-lg font-bold text-slate-900 dark:text-white">
        Mr. Cash Auto Sales
      </p>

      <nav className="no-scrollbar flex flex-1 flex-row gap-1 overflow-x-auto sm:flex-col">
        <Link
          href="/admin/dashboard"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("dashboard")}
        </Link>
        <Link
          href="/admin/vehicles"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("vehicles")}
        </Link>
        <Link
          href="/admin/messages"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("messages")}
        </Link>
        <Link
          href="/admin/reviews"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("reviews")}
        </Link>
        <Link
          href="/admin/settings"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("settings")}
        </Link>
        <Link
          href="/admin/account"
          className="whitespace-nowrap rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("account")}
        </Link>
      </nav>

      <div className="mt-2 flex flex-col gap-1 border-t border-slate-100 pt-2 dark:border-slate-800">
        <Link
          href="/"
          className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
        >
          {t("viewSite")}
        </Link>
        <form action={logoutWithLocale}>
          <button
            type="submit"
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            {t("logout")}
          </button>
        </form>
      </div>
    </aside>
  );
}
