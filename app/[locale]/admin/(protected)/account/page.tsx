import { getTranslations } from "next-intl/server";
import { getSession } from "@/lib/auth";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export default async function AdminAccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.account");
  const session = await getSession();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">
        {t("loggedInAs", { name: session?.name ?? "", email: session?.email ?? "" })}
      </p>

      <div className="mt-6 max-w-md rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h2 className="font-semibold text-slate-900 dark:text-white">{t("changePasswordTitle")}</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t("changePasswordSubtitle")}</p>
        <div className="mt-4">
          <ChangePasswordForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
