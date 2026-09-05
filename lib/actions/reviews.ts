"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { ReviewFormSchema, type ReviewFormState } from "@/lib/definitions";
import type { ReviewStatus } from "@/lib/generated/prisma/client";

// Public "leave a review" form → creates a Review with the default status
// (PENDING). It stays hidden from the public site until an admin approves it,
// so there's nothing to revalidate here.
export async function submitReview(
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const validated = ReviewFormSchema.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, rating, comment } = validated.data;

  await prisma.review.create({
    data: { name, rating, comment },
  });

  return { success: true };
}

// Admin actions. Each takes only the review id (plus locale for revalidation)
// and derives everything else from a trusted source — the client never
// supplies the review's contents. Bound as e.g.
// approveReview.bind(null, locale, review.id) and used as a <form action>.
function revalidateReviewPaths(locale: string) {
  revalidatePath(`/${locale}/admin/reviews`);
  revalidatePath(`/${locale}/admin/dashboard`);
  revalidatePath(`/${locale}/reviews`);
  revalidatePath(`/${locale}`);
}

async function setReviewStatus(locale: string, id: string, status: ReviewStatus) {
  await verifySession(locale);
  await prisma.review.update({ where: { id }, data: { status } });
  revalidateReviewPaths(locale);
}

export async function approveReview(locale: string, id: string) {
  await setReviewStatus(locale, id, "APPROVED");
}

export async function rejectReview(locale: string, id: string) {
  await setReviewStatus(locale, id, "REJECTED");
}

export async function deleteReview(locale: string, id: string) {
  await verifySession(locale);
  await prisma.review.delete({ where: { id } });
  revalidateReviewPaths(locale);
}
