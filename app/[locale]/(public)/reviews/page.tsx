import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import ReviewForm from "@/components/ReviewForm";
import ReviewsList from "@/components/ReviewsList";
import StarRating from "@/components/StarRating";
import { getApprovedReviews, getApprovedReviewSummary } from "@/lib/reviews";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return {
    title: t("title"),
    description: t("subtitle"),
    alternates: buildAlternates(locale, "/reviews"),
  };
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("reviews");
  const [reviews, summary] = await Promise.all([
    getApprovedReviews(),
    getApprovedReviewSummary(),
  ]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{t("title")}</h1>
      <p className="mt-2 text-slate-600 dark:text-slate-400">{t("subtitle")}</p>

      {summary.average != null && (
        <div className="mt-4 flex items-center gap-2">
          <StarRating rating={summary.average} className="h-5 w-5" />
          <span className="text-sm text-slate-600 dark:text-slate-400">
            {t("averageSummary", {
              rating: summary.average.toFixed(1),
              count: summary.count,
            })}
          </span>
        </div>
      )}

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="order-2 lg:order-1">
          <ReviewsList reviews={reviews} />
        </div>

        <div className="order-1 lg:order-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {t("leaveTitle")}
            </h2>
            <div className="mt-4">
              <ReviewForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
