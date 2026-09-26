import { Fragment } from "react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import VehicleGrid from "@/components/VehicleGrid";
import CtaButtons from "@/components/CtaButtons";
import QuickSearchBar from "@/components/QuickSearchBar";
import ReviewsList from "@/components/ReviewsList";
import StarRating from "@/components/StarRating";
import Reveal from "@/components/Reveal";
import CountUp from "@/components/CountUp";
import HeroCar from "@/components/HeroCar";
import {
  getFeaturedVehicles,
  getDistinctMakes,
  getAvailableVehicleCount,
} from "@/lib/vehicles";
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
  const [featured, makes, reviews, reviewSummary, availableCount] = await Promise.all([
    getFeaturedVehicles(),
    getDistinctMakes(),
    getApprovedReviews(4),
    getApprovedReviewSummary(),
    getAvailableVehicleCount(),
  ]);

  return (
    <div>
      {/* data-hero-intro sequences the headline reveal with the 3D car —
          see the "Home hero choreography" section of globals.css. */}
      <section
        data-hero-intro="pending"
        className="relative overflow-hidden bg-[#0b1a33] text-white"
      >
        {/* Background photo — same image/overlay treatment for both locales,
            since this page is shared across /en and /es. Extends above the
            hero so the scroll parallax never reveals an edge. */}
        <div
          className="hero-bg absolute inset-x-0 -top-[20vh] bottom-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1494783367193-149034c05e8f?w=1920&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0b1a33] via-[#0b1a33]/85 to-[#0b1a33]/30" />
        <div className="hero-warmth absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0b1a33]/70 via-transparent to-transparent" />

        <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 pb-20 pt-24 sm:px-6 sm:pb-28 sm:pt-32">
          <h1 className="max-w-2xl text-4xl font-bold tracking-tight drop-shadow-sm sm:text-5xl lg:max-w-[calc(50%-1rem)]">
            <RevealWords text={t("heroTitle")} />
          </h1>
          <p className="max-w-xl text-lg text-slate-200 drop-shadow-sm lg:max-w-[calc(50%-1rem)]">
            {/* Follows the headline's words in the reveal stagger. */}
            <span className="hero-line">
              <span style={{ "--i": 6 } as React.CSSProperties}>{t("heroSubtitle")}</span>
            </span>
          </p>
          {/* On phones the car sits in the flow between the copy and the CTAs;
              from lg up it fills the right half of the hero, bleeding to the
              viewport edge so it can drive in from off-screen. */}
          <HeroCar className="relative -mx-4 -my-2 h-52 w-[calc(100%+2rem)] sm:mx-0 sm:h-72 sm:w-full lg:absolute lg:inset-y-0 lg:left-1/2 lg:right-[calc(50%-50vw)] lg:mx-0 lg:my-0 lg:h-auto lg:w-auto" />
          <div className="w-full sm:w-auto lg:max-w-[calc(50%-1rem)]">
            <CtaButtons />
          </div>
        </div>
      </section>

      {/* Quick search card, overlapping the bottom edge of the hero. */}
      <div className="relative mx-auto -mt-8 max-w-4xl px-4 sm:-mt-10 sm:px-6">
        <QuickSearchBar makes={makes} />
      </div>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <Reveal>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("whyUsTitle")}
          </h2>
        </Reveal>
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-3">
          <Reveal delay={0}>
            <WhyUsCard title={t("whyUs1Title")} body={t("whyUs1Body")} />
          </Reveal>
          <Reveal delay={90}>
            <WhyUsCard title={t("whyUs2Title")} body={t("whyUs2Body")} />
          </Reveal>
          <Reveal delay={180}>
            <WhyUsCard title={t("whyUs3Title")} body={t("whyUs3Body")} />
          </Reveal>
        </div>
      </section>

      {/* Stats band — every number comes from live data (or, for "100%
          inspected", from the promise already made in Why Buy From Us). */}
      <section className="bg-[#0b1a33] text-white">
        <Reveal className="mx-auto flex max-w-6xl flex-wrap justify-center gap-y-8 px-4 py-12 sm:px-6">
          {availableCount > 0 && (
            <Stat label={t("statVehicles")}>
              <CountUp value={availableCount} />
            </Stat>
          )}
          <Stat label={t("statInspected")}>
            <CountUp value={100} suffix="%" />
          </Stat>
          {reviewSummary.average != null && (
            <Stat label={t("statRating")}>
              <CountUp value={reviewSummary.average} decimals={1} suffix="★" />
            </Stat>
          )}
          {reviewSummary.count > 0 && (
            <Stat label={t("statReviews")}>
              <CountUp value={reviewSummary.count} />
            </Stat>
          )}
        </Reveal>
      </section>

      {reviews.length > 0 && (
        <section className="bg-slate-50 py-14 dark:bg-slate-950">
          <Reveal className="mx-auto max-w-6xl px-4 sm:px-6">
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
          </Reveal>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 pb-16 pt-14 sm:px-6">
        <Reveal className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {t("featuredTitle")}
          </h2>
          <Link href="/inventory" className="text-sm font-medium text-blue-600 hover:underline">
            {t("viewAll")}
          </Link>
        </Reveal>
        <div className="mt-6">
          <VehicleGrid vehicles={featured} />
        </div>
      </section>
    </div>
  );
}

/** Wraps each word in its own mask so they can rise in one by one. */
function RevealWords({ text }: { text: string }) {
  return text.split(" ").map((word, i) => (
    <Fragment key={i}>
      {i > 0 && " "}
      <span className="hero-line">
        <span style={{ "--i": i } as React.CSSProperties}>{word}</span>
      </span>
    </Fragment>
  ));
}

function Stat({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex w-1/2 flex-col items-center px-2 text-center lg:w-1/4">
      <span className="text-3xl font-bold tracking-tight text-amber-400 sm:text-4xl">
        {children}
      </span>
      <span className="mt-1 text-sm text-slate-300">{label}</span>
    </div>
  );
}

function WhyUsCard({ title, body }: { title: string; body: string }) {
  return (
    <div className="h-full rounded-xl border border-slate-200 bg-white p-6 transition-[translate,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5 motion-reduce:transition-none dark:border-slate-800 dark:bg-slate-900">
      <h3 className="font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{body}</p>
    </div>
  );
}
