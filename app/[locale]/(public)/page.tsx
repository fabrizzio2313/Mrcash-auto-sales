import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VehicleGrid from "@/components/VehicleGrid";
import CtaButtons from "@/components/CtaButtons";
import QuickSearchBar from "@/components/QuickSearchBar";
import ReviewsList from "@/components/ReviewsList";
import StarRating from "@/components/StarRating";
import { getFeaturedVehicles, getDistinctMakes } from "@/lib/vehicles";
import { getApprovedReviews, getApprovedReviewSummary } from "@/lib/reviews";
import { buildAlternates } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seo" });
  return {
    title: t("home.title"),
    description: t("home.description"),
    alternates: buildAlternates(locale, "/"),
  };
}

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("home");
  const tReviews = await getTranslations("reviews");
  const [featured, makes, reviews, reviewSummary] = await Promise.all([
    getFeaturedVehicles(),
    getDistinctMakes(),
    getApprovedReviews(4),
    getApprovedReviewSummary(),
  ]);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#0b1a33] text-white">
        {/* Background photo — same image/overlay treatment for both locales,
            since this page is shared across /en and /es. */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a33] via-[#0b1a33]/85 to-[#0b1a33]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a33]/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl">
            {t("heroTitle")}
          </h1>
          <p className="max-w-xl text-lg text-slate-200 drop-shadow-sm">
            {t("heroSubtitle")}
          </p>
          <CtaButtons />
        </div>
      </section>

      {/* Quick search card, overlapping the bottom edge of the hero. */}
      <div className="relative mx-auto -mt-8 max-w-4xl px-4 sm:-mt-10 sm:px-6">
        <QuickSearchBar makes={makes} />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          {t("whyUsTitle")}
        </h2>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <WhyUsCard title={t("whyUs1Title")} body={t("whyUs1Body")} />
          <WhyUsCard title={t("whyUs2Title")} body={t("whyUs2Body")} />
          <WhyUsCard title={t("whyUs3Title")} body={t("whyUs3Body")} />
        </div>
      </section>

      {reviews.length > 0 && (
        <section className="bg-slate-50 py-14 dark:bg-slate-950">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  {tReviews("homeTitle")}
                </h2>
                {reviewSummary.average != null && (
                  <div className="mt-2 flex items-center gap-2">
                    <StarRating rating={reviewSummary.average} className="h-4 w-4" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {tReviews("averageSummary", {
                        rating: reviewSummary.average.toFixed(1),
                        count: reviewSummary.count,
                      })}
                    </span>
                  </div>
                )}
              </div>
              <Link
                href="/reviews"
                className="text-sm font-medium text-blue-600 hover:underline"
              >
                {tReviews("viewAll")}
              </Link>
            </div>
            <div className="mt-6">
              <ReviewsList reviews={reviews} />
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("featuredTitle")}
          </h2>
          <Link href="/inventory" className="text-sm font-medium text-blue-600 hover:underline">
            {t("viewAll")}
          </Link>
        </div>
        <div className="mt-6">
          <VehicleGrid vehicles={featured} />
        </div>
      </section>
    </div>
  );
}

function WhyUsCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{body}</p>
    </div>
  );
}
