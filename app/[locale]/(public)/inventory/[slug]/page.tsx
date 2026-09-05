import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import StatusBadge from "@/components/StatusBadge";
import PhotoGallery from "@/components/PhotoGallery";
import CtaButtons from "@/components/CtaButtons";
import ContactForm from "@/components/ContactForm";
import ShareButtons from "@/components/ShareButtons";
import { getVehicleBySlug } from "@/lib/vehicles";
import { buildAlternates, jsonLdScriptProps } from "@/lib/seo";
import { site } from "@/lib/site";

type PageParams = { slug: string; locale: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) return {};

  const t = await getTranslations({ locale, namespace: "vehicle" });
  const title = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  const description = t("metaDescription", {
    year: vehicle.year,
    make: vehicle.make,
    model: vehicle.model,
    price: vehicle.price.toLocaleString(),
    mileage: vehicle.mileage.toLocaleString(),
  });
  const image = vehicle.photos[0]?.url;

  return {
    title,
    description,
    alternates: buildAlternates(locale, `/inventory/${slug}`),
    openGraph: {
      title,
      description,
      images: image ? [{ url: image }] : undefined,
      type: "website",
    },
  };
}

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug, locale } = await params;
  const vehicle = await getVehicleBySlug(slug);

  if (!vehicle) notFound();

  const t = await getTranslations("vehicle");

  const vehicleTitle = `${vehicle.year} ${vehicle.make} ${vehicle.model}${vehicle.trim ? ` ${vehicle.trim}` : ""}`;
  // Absolute, public URL — same one used for the canonical/OpenGraph tags, so
  // the Facebook share preview resolves to the right page. `site.url` is the
  // production domain configured in lib/site.ts.
  const shareUrl = `${site.url}/${locale}/inventory/${vehicle.slug}`;

  const features = (vehicle.features ?? "")
    .split("\n")
    .map((f) => f.trim())
    .filter(Boolean);

  const specs: Array<[string, string]> = [
    [t("year"), String(vehicle.year)],
    [t("make"), vehicle.make],
    [t("model"), vehicle.model],
    ...(vehicle.trim ? ([[t("trim"), vehicle.trim]] as [string, string][]) : []),
    [t("mileage"), `${vehicle.mileage.toLocaleString()} ${t("miles")}`],
    ...(vehicle.color ? ([[t("color"), vehicle.color]] as [string, string][]) : []),
    [t("fuelType"), t(`fuel.${vehicle.fuelType}`)],
    [t("transmission"), t(`transmissionType.${vehicle.transmission}`)],
    ...(vehicle.bodyType ? ([[t("bodyType"), vehicle.bodyType]] as [string, string][]) : []),
    ...(vehicle.vin ? ([[t("vin"), vehicle.vin]] as [string, string][]) : []),
    ...(vehicle.stockNumber
      ? ([[t("stockNumber"), vehicle.stockNumber]] as [string, string][])
      : []),
  ];

  const FUEL_TYPE_SCHEMA: Record<string, string> = {
    GASOLINE: "Gasoline",
    DIESEL: "Diesel",
    HYBRID: "Hybrid",
    ELECTRIC: "Electric",
  };
  const AVAILABILITY_SCHEMA: Record<string, string> = {
    AVAILABLE: "https://schema.org/InStock",
    PENDING: "https://schema.org/LimitedAvailability",
    SOLD: "https://schema.org/OutOfStock",
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Vehicle",
    name: vehicleTitle,
    brand: { "@type": "Brand", name: vehicle.make },
    model: vehicle.model,
    vehicleModelDate: String(vehicle.year),
    modelDate: String(vehicle.year),
    ...(vehicle.vin ? { vehicleIdentificationNumber: vehicle.vin } : {}),
    ...(vehicle.color ? { color: vehicle.color } : {}),
    ...(vehicle.bodyType ? { bodyType: vehicle.bodyType } : {}),
    fuelType: FUEL_TYPE_SCHEMA[vehicle.fuelType],
    vehicleTransmission: vehicle.transmission === "AUTOMATIC" ? "Automatic" : "Manual",
    mileageFromOdometer: {
      "@type": "QuantitativeValue",
      value: vehicle.mileage,
      unitCode: "SMI",
    },
    itemCondition: "https://schema.org/UsedCondition",
    ...(vehicle.description ? { description: vehicle.description } : {}),
    ...(vehicle.photos.length > 0 ? { image: vehicle.photos.map((p) => p.url) } : {}),
    offers: {
      "@type": "Offer",
      price: vehicle.price,
      priceCurrency: "USD",
      availability: AVAILABILITY_SCHEMA[vehicle.status],
      itemCondition: "https://schema.org/UsedCondition",
      url: shareUrl,
    },
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <script {...jsonLdScriptProps(jsonLd)} />

      <Link href="/inventory" className="text-sm font-medium text-blue-600 hover:underline">
        &larr; {t("backToInventory")}
      </Link>

      <div className="mt-4 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-10">
        <PhotoGallery
          photos={vehicle.photos}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
          onSaleLabel={vehicle.onSale ? t("onSale") : undefined}
        />

        <div>
          <div className="flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {vehicleTitle}
            </h1>
            <StatusBadge status={vehicle.status} />
          </div>
          <div className="mt-2 flex items-baseline gap-3">
            <p className="text-3xl font-bold text-blue-600">
              ${vehicle.price.toLocaleString()}
            </p>
            {vehicle.onSale && vehicle.originalPrice && (
              <p className="text-lg text-slate-400 line-through">
                ${vehicle.originalPrice.toLocaleString()}
              </p>
            )}
          </div>

          <ShareButtons url={shareUrl} title={vehicleTitle} />

          {vehicle.description && (
            <>
              <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("description")}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-slate-700 dark:text-slate-300">
                {vehicle.description}
              </p>
            </>
          )}

          {features.length > 0 && (
            <>
              <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {t("features")}
              </h2>
              <ul className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm text-slate-700 dark:text-slate-300 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature} className="flex items-center gap-1.5">
                    <span className="text-blue-600">&#10003;</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </>
          )}

          <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {t("specifications")}
          </h2>
          <dl className="mt-2 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2 sm:gap-y-2">
            {specs.map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-100 py-1.5 dark:border-slate-800">
                <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
                <dd className="font-medium text-slate-900 dark:text-white">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-8 rounded-xl bg-[#0b1a33] p-5">
            <h2 className="font-semibold text-white">{t("interestedTitle")}</h2>
            <p className="mb-4 mt-1 text-sm text-slate-300">{t("contactAbout")}</p>
            <CtaButtons vehicleId={vehicle.id} />
          </div>

          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="font-semibold text-slate-900 dark:text-white">
              {t("sendMessage")}
            </h2>
            <div className="mt-4">
              <ContactForm vehicleId={vehicle.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
