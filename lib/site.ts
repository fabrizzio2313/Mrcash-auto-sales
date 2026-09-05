// Business info shown wherever a phone/SMS/WhatsApp link, address, email, or
// opening hours appears (header CTAs, footer, contact + location pages).
//
// These are the compiled-in *defaults*. Admins can override any of them from
// the panel at /admin/settings without touching code — see the `Settings`
// model in prisma/schema.prisma and `getSite()` in lib/settings.ts, which
// merges the saved values on top of these. A field left blank in the panel
// falls back to the default here, so the site always has something to show.

const DEFAULT_PHONE_E164 = "+18632410086";

export const SITE_DEFAULTS = {
  name: "Mr. Cash Auto Sales",
  // Production domain — used for canonical URLs, hreflang, sitemap, robots and
  // JSON-LD. Not editable from the panel (it's infrastructure, not content);
  // change it here when the real domain is ready.
  url: "https://www.mrcashautosales.example",
  phoneDisplay: "(863) 241-0086",
  phoneE164: DEFAULT_PHONE_E164,
  whatsappE164: DEFAULT_PHONE_E164,
  email: "sales@mrcashautosales.example",
  addressLine1: "244 E Bullard Ave",
  addressLine2: "Lake Wales, FL 33853",
  hoursWeekdays: "9:00 AM – 7:00 PM",
  hoursSaturday: "10:00 AM – 5:00 PM",
  hoursSunday: "Closed",
  facebookUrl: "",
};

export type SiteDefaults = typeof SITE_DEFAULTS;
export type SiteOverrides = Partial<Record<keyof SiteDefaults, string | null | undefined>>;

/**
 * Merges saved overrides on top of SITE_DEFAULTS (blank/nullish values are
 * ignored) and derives the values templates actually use — `tel:`/`sms:`/
 * `wa.me` links, the joined address, the hours object, and the Google Maps
 * embed/link URLs.
 */
export function buildSite(overrides: SiteOverrides = {}) {
  const merged = { ...SITE_DEFAULTS };
  for (const key of Object.keys(SITE_DEFAULTS) as (keyof SiteDefaults)[]) {
    const value = overrides[key];
    if (typeof value === "string" && value.trim() !== "") {
      merged[key] = value.trim();
    }
  }

  const addressFull = [merged.addressLine1, merged.addressLine2]
    .filter(Boolean)
    .join(", ");
  const waNumber = (merged.whatsappE164 || merged.phoneE164).replace(/[^\d]/g, "");

  return {
    name: merged.name,
    url: merged.url,
    phoneDisplay: merged.phoneDisplay,
    phoneHref: `tel:${merged.phoneE164}`,
    smsHref: `sms:${merged.phoneE164}`,
    whatsappHref: (message: string) =>
      `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`,
    email: merged.email,
    facebookUrl: merged.facebookUrl,
    address: {
      line1: merged.addressLine1,
      line2: merged.addressLine2,
      full: addressFull,
    },
    hours: {
      mondayFriday: merged.hoursWeekdays,
      saturday: merged.hoursSaturday,
      sunday: merged.hoursSunday,
    },
    // Legacy Google Maps embed endpoint — works with a plain address query and
    // no API key (unlike the newer Maps Embed API).
    mapEmbedSrc: `https://www.google.com/maps?q=${encodeURIComponent(addressFull)}&output=embed`,
    mapLinkHref: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressFull)}`,
  };
}

export type Site = ReturnType<typeof buildSite>;

// Defaults-only snapshot, safe to use in non-async contexts (SEO metadata,
// sitemap, robots — all of which only need `url`/`name`). Server components
// that render editable info should call `getSite()` from lib/settings.ts.
export const site = buildSite();
