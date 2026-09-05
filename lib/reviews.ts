import { prisma } from "@/lib/prisma";

// Approved reviews only — this is what the public site shows.
export async function getApprovedReviews(limit?: number) {
  return prisma.review.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" }, // newest first
    ...(limit ? { take: limit } : {}),
  });
}

// Count + average rating across approved reviews, for the summary line.
// average is null when there are no approved reviews yet.
export async function getApprovedReviewSummary() {
  const agg = await prisma.review.aggregate({
    where: { status: "APPROVED" },
    _count: true,
    _avg: { rating: true },
  });
  return {
    count: agg._count,
    average: agg._avg.rating,
  };
}

// Every review, grouped by status — the admin view. Pending first (needs
// action), then approved, then rejected.
export async function getReviewsByStatus() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
  });
  return {
    pending: reviews.filter((r) => r.status === "PENDING"),
    approved: reviews.filter((r) => r.status === "APPROVED"),
    rejected: reviews.filter((r) => r.status === "REJECTED"),
  };
}

export async function getPendingReviewCount() {
  return prisma.review.count({ where: { status: "PENDING" } });
}
