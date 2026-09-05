import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { buildSite } from "@/lib/site";

// The Settings table holds a single row with this id (see prisma/schema.prisma).
export const SETTINGS_ID = "singleton";

/**
 * Loads the saved business settings row (or null if it's never been saved).
 * Memoized per-request with React's `cache` so the header, footer and page
 * body only hit the DB once.
 */
export const getSettings = cache(async () => {
  try {
    return await prisma.settings.findUnique({ where: { id: SETTINGS_ID } });
  } catch {
    // Table missing (migrations not run yet) — fall back to defaults.
    return null;
  }
});

/**
 * The resolved site config: saved settings merged over the compiled-in
 * defaults, with all the derived links/URLs computed. This is what server
 * components should use instead of importing `site` directly.
 */
export async function getSite() {
  const s = await getSettings();
  return buildSite({
    name: s?.businessName,
    phoneDisplay: s?.phoneDisplay,
    phoneE164: s?.phoneE164,
    whatsappE164: s?.whatsappE164,
    email: s?.email,
    addressLine1: s?.addressLine1,
    addressLine2: s?.addressLine2,
    hoursWeekdays: s?.hoursWeekdays,
    hoursSaturday: s?.hoursSaturday,
    hoursSunday: s?.hoursSunday,
    facebookUrl: s?.facebookUrl,
  });
}
