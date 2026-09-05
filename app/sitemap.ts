import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";
import { getAllVehicleSlugs } from "@/lib/vehicles";

const STATIC_PATHS = [
  "",
  "/inventory",
  "/about",
  "/contact",
  "/financing",
  "/test-drive",
  "/faq",
  "/reviews",
  "/location",
];

function languageAlternates(path: string) {
  const languages: Record<string, string> = {};
  for (const locale of routing.locales) {
    languages[locale] = `${site.url}/${locale}${path}`;
  }
  return { languages };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: MetadataRoute.Sitemap = STATIC_PATHS.flatMap((path) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency: path === "" ? ("weekly" as const) : ("monthly" as const),
      priority: path === "" ? 1 : 0.7,
      alternates: languageAlternates(path),
    }))
  );

  const vehicles = await getAllVehicleSlugs();
  // Sold vehicles' pages still work, but there's no lasting SEO value in
  // keeping a stale listing indexed once it's no longer for sale.
  const activeVehicles = vehicles.filter((v) => v.status !== "SOLD");

  const vehicleEntries: MetadataRoute.Sitemap = activeVehicles.flatMap((vehicle) =>
    routing.locales.map((locale) => ({
      url: `${site.url}/${locale}/inventory/${vehicle.slug}`,
      lastModified: vehicle.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
      alternates: languageAlternates(`/inventory/${vehicle.slug}`),
    }))
  );

  return [...staticEntries, ...vehicleEntries];
}
