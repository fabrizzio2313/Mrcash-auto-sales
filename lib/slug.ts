// Turns arbitrary text into a URL-safe slug: lowercase, accents stripped,
// non-alphanumeric runs collapsed to a single hyphen, no leading/trailing
// hyphens. Used for vehicle detail page URLs (e.g. /inventory/2022-honda-civic-lx).
export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "") // strip accents (e.g. é -> e, ñ -> n)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildVehicleSlugBase(vehicle: {
  year: number;
  make: string;
  model: string;
  trim?: string | null;
}): string {
  const parts = [String(vehicle.year), vehicle.make, vehicle.model, vehicle.trim ?? ""].filter(
    Boolean
  );
  return slugify(parts.join(" "));
}
