"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { generateUniqueVehicleSlug } from "@/lib/vehicles";
import { VehicleFormSchema, type VehicleFormState } from "@/lib/definitions";

function parsePhotoUrls(raw?: string) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url, order) => ({ url, order }));
}

// originalPrice arrives as a string (see lib/definitions.ts for why) — turn
// "" into null and a numeric string into an int.
function parseOriginalPrice(raw?: string) {
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
}

function revalidateVehiclePaths(locale: string, slug?: string) {
  revalidatePath(`/${locale}/admin/vehicles`);
  revalidatePath(`/${locale}/inventory`);
  revalidatePath(`/${locale}`);
  if (slug) revalidatePath(`/${locale}/inventory/${slug}`);
}

export async function createVehicle(
  locale: string,
  _prevState: VehicleFormState,
  formData: FormData
): Promise<VehicleFormState> {
  await verifySession(locale);

  const validated = VehicleFormSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { photos, featured, onSale, originalPrice, ...data } = validated.data;
  const slug = await generateUniqueVehicleSlug(data);

  await prisma.vehicle.create({
    data: {
      ...data,
      slug,
      featured: Boolean(featured),
      onSale: Boolean(onSale),
      originalPrice: parseOriginalPrice(originalPrice),
      photos: { create: parsePhotoUrls(photos) },
    },
  });

  revalidateVehiclePaths(locale, slug);
  redirect(`/${locale}/admin/vehicles`);
}

// Bound as updateVehicle.bind(null, locale, vehicleId)
export async function updateVehicle(
  locale: string,
  id: string,
  _prevState: VehicleFormState,
  formData: FormData
): Promise<VehicleFormState> {
  await verifySession(locale);

  const validated = VehicleFormSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors as Record<string, string[]> };
  }

  const { photos, featured, onSale, originalPrice, ...data } = validated.data;
  // Re-slugging on every edit keeps the URL in sync with year/make/model/trim
  // (e.g. after fixing a typo). This means the URL can change when those
  // fields do — acceptable here since there's no public link history to
  // preserve yet, but worth knowing if you add inbound links later.
  const slug = await generateUniqueVehicleSlug(data, id);
  const previous = await prisma.vehicle.findUnique({ where: { id }, select: { slug: true } });

  await prisma.vehicle.update({
    where: { id },
    data: {
      ...data,
      slug,
      featured: Boolean(featured),
      onSale: Boolean(onSale),
      originalPrice: parseOriginalPrice(originalPrice),
      photos: {
        deleteMany: {},
        create: parsePhotoUrls(photos),
      },
    },
  });

  revalidateVehiclePaths(locale, slug);
  if (previous && previous.slug !== slug) revalidateVehiclePaths(locale, previous.slug);
  redirect(`/${locale}/admin/vehicles`);
}

// Bound as deleteVehicle.bind(null, locale, vehicleId) and used directly as a
// <form action={...}> — works without client JS.
export async function deleteVehicle(locale: string, id: string) {
  await verifySession(locale);
  const vehicle = await prisma.vehicle.delete({ where: { id } });
  revalidateVehiclePaths(locale, vehicle.slug);
}

export async function toggleFeatured(
  locale: string,
  id: string,
  featured: boolean
) {
  await verifySession(locale);
  const vehicle = await prisma.vehicle.update({ where: { id }, data: { featured } });
  revalidateVehiclePaths(locale, vehicle.slug);
}
