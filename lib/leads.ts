import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export type LeadFilters = {
  type?: "TEST_DRIVE" | "FINANCING" | "GENERAL_INQUIRY";
  status?: "NEW" | "CONTACTED" | "CLOSED";
  search?: string;
};

export async function getLeads(filters: LeadFilters = {}) {
  const { type, status, search } = filters;

  const where: Prisma.LeadWhereInput = {};
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { email: { contains: search } },
      { phone: { contains: search } },
    ];
  }

  return prisma.lead.findMany({
    where,
    orderBy: { createdAt: "desc" }, // newest first
    include: { vehicle: true },
  });
}
