import { getTranslations } from "next-intl/server";
import { getSettings } from "@/lib/settings";
import { SITE_DEFAULTS } from "@/lib/site";
import { updateSettings } from "@/lib/actions/settings";
import SettingsForm from "@/components/admin/SettingsForm";

export default async function AdminSettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.settings");
  const settings = await getSettings();
  const updateWithLocale = updateSettings.bind(null, locale);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-6 max-w-2xl rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <SettingsForm
          action={updateWithLocale}
          settings={settings}
          defaults={SITE_DEFAULTS}
        />
      </div>
    </div>
  );
}
