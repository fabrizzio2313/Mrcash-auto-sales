import { getTranslations } from "next-intl/server";
import StarRating from "@/components/StarRating";
import type { Review } from "@/lib/generated/prisma/client";

export default async function ReviewsList({ reviews }: { reviews: Review[] }) {
  const t = await getTranslations("reviews");

  if (reviews.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-slate-500 dark:border-slate-700 dark:text-slate-400">
        {t("empty")}
      </p>
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {reviews.map((review) => (
        <li
          key={review.id}
          className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
        >
          <StarRating rating={review.rating} className="h-4 w-4" />
          <p className="mt-3 flex-1 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
            {review.comment}
          </p>
          <p className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
            {review.name}
          </p>
          <p className="text-xs text-slate-400">
            {new Date(review.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
