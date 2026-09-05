import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.login");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 dark:bg-slate-950">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-center text-xl font-bold text-slate-900 dark:text-white">
          Mr. Cash Auto Sales
        </p>
        <h1 className="mt-4 text-center text-lg font-semibold text-slate-900 dark:text-white">
          {t("title")}
        </h1>
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          {t("subtitle")}
        </p>

        <div className="mt-6">
          <LoginForm locale={locale} />
        </div>
      </div>
    </div>
  );
}
