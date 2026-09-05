import { getTranslations } from "next-intl/server";
import ReviewsAdmin from "@/components/admin/ReviewsAdmin";
import { getReviewsByStatus } from "@/lib/reviews";

export default async function AdminReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("admin.reviews");
  const reviews = await getReviewsByStatus();

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-1 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      <div className="mt-6">
        <ReviewsAdmin reviews={reviews} locale={locale} />
      </div>
    </div>
  );
}
