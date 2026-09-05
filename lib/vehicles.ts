import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";
import { buildVehicleSlugBase } from "@/lib/slug";

// Generates a unique slug for a vehicle from year/make/model/trim, appending
// "-2", "-3", etc. if there's a collision (e.g. two 2022 Honda Civic LX).
// Pass `excludeId` when re-slugging an existing vehicle on update, so it
// doesn't collide with its own current slug.
export async function generateUniqueVehicleSlug(
  vehicle: { year: number; make: string; model: string; trim?: string | null },
  excludeId?: string
): Promise<string> {
  const base = buildVehicleSlugBase(vehicle) || "vehicle";
  let slug = base;
  let attempt = 2;

  while (
    await prisma.vehicle.findFirst({
      where: { slug, ...(excludeId ? { id: { not: excludeId } } : {}) },
      select: { id: true },
    })
  ) {
    slug = `${base}-${attempt}`;
    attempt++;
  }

  return slug;
}

export type VehicleFilters = {
  search?: string;
  make?: string;
  model?: string;
  yearMin?: number;
  priceMax?: number;
  mileageMax?: number;
  status?: "AVAILABLE" | "PENDING" | "SOLD";
  sort?: "newest" | "price-asc" | "price-desc";
};

export async function getVehicles(filters: VehicleFilters = {}) {
  const { search, make, model, yearMin, priceMax, mileageMax, status, sort = "newest" } = filters;

  const where: Prisma.VehicleWhereInput = {};

  if (search) {
    where.OR = [
      { make: { contains: search } },
      { model: { contains: search } },
    ];
  }
  if (make) where.make = make;
  if (model) where.model = model;
  if (yearMin) where.year = { gte: yearMin };
  if (priceMax) where.price = { lte: priceMax };
  if (mileageMax) where.mileage = { lte: mileageMax };
  if (status) where.status = status;

  const orderBy: Prisma.VehicleOrderByWithRelationInput =
    sort === "price-asc"
      ? { price: "asc" }
      : sort === "price-desc"
        ? { price: "desc" }
        : { createdAt: "desc" };

  return prisma.vehicle.findMany({
    where,
    orderBy,
    include: { photos: { orderBy: { order: "asc" } } },
  });
}

export async function getVehicleById(id: string) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: { photos: { orderBy: { order: "asc" } } },
  });
}

export async function getVehicleBySlug(slug: string) {
  return prisma.vehicle.findUnique({
    where: { slug },
    include: { photos: { orderBy: { order: "asc" } } },
  });
}

export async function getAllVehicleSlugs() {
  return prisma.vehicle.findMany({
    select: { slug: true, updatedAt: true, status: true },
  });
}

export async function getFeaturedVehicles(limit = 3) {
  return prisma.vehicle.findMany({
    where: { featured: true, status: "AVAILABLE" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { photos: { orderBy: { order: "asc" } } },
  });
}

export async function getAvailableVehicles() {
  return prisma.vehicle.findMany({
    where: { status: "AVAILABLE" },
    orderBy: [{ make: "asc" }, { model: "asc" }],
  });
}

export async function getDistinctMakes() {
  const rows = await prisma.vehicle.findMany({
    distinct: ["make"],
    select: { make: true },
    orderBy: { make: "asc" },
  });
  return rows.map((r) => r.make);
}

export async function getDistinctModels(make?: string) {
  const rows = await prisma.vehicle.findMany({
    where: make ? { make } : undefined,
    distinct: ["model"],
    select: { model: true },
    orderBy: { model: "asc" },
  });
  return rows.map((r) => r.model);
}

export async function getVehicleStats() {
  const [total, available, sold] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "AVAILABLE" } }),
    prisma.vehicle.count({ where: { status: "SOLD" } }),
  ]);
  const [newLeads, pendingReviews] = await Promise.all([
    prisma.lead.count({ where: { status: "NEW" } }),
    prisma.review.count({ where: { status: "PENDING" } }),
  ]);
  return { total, available, sold, newLeads, pendingReviews };
}
