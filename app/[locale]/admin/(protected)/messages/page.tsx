import { getTranslations } from "next-intl/server";
import MessagesTable from "@/components/admin/MessagesTable";
import LeadFilters from "@/components/admin/LeadFilters";
import { getLeads } from "@/lib/leads";
import type { LeadFilters as LeadFiltersType } from "@/lib/leads";

export default async function AdminMessagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string; type?: string; status?: string }>;
}) {
  const { locale } = await params;
  const sp = await searchParams;
  const t = await getTranslations("admin.messages");

  const leads = await getLeads({
    type: (sp.type as LeadFiltersType["type"]) || undefined,
    status: (sp.status as LeadFiltersType["status"]) || undefined,
    search: sp.search || undefined,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>

      <div className="mt-4">
        <LeadFilters defaults={sp} />
      </div>

      <div className="mt-6">
        <MessagesTable leads={leads} locale={locale} />
      </div>
    </div>
  );
}
