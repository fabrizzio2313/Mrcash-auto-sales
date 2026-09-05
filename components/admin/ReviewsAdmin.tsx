import { getTranslations } from "next-intl/server";
import StarRating from "@/components/StarRating";
import ConfirmForm from "@/components/admin/ConfirmForm";
import { approveReview, rejectReview, deleteReview } from "@/lib/actions/reviews";
import type { Review } from "@/lib/generated/prisma/client";

type Group = "pending" | "approved" | "rejected";

export default async function ReviewsAdmin({
  reviews,
  locale,
}: {
  reviews: { pending: Review[]; approved: Review[]; rejected: Review[] };
  locale: string;
}) {
  const t = await getTranslations("admin.reviews");

  const groups: { key: Group; title: string; items: Review[]; empty: string }[] = [
    { key: "pending", title: t("pendingTitle"), items: reviews.pending, empty: t("noPending") },
    { key: "approved", title: t("approvedTitle"), items: reviews.approved, empty: t("noApproved") },
    { key: "rejected", title: t("rejectedTitle"), items: reviews.rejected, empty: t("noRejected") },
  ];

  return (
    <div className="flex flex-col gap-8">
      {groups.map((group) => (
        <section key={group.key}>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {group.title} ({group.items.length})
          </h2>

          {group.items.length === 0 ? (
            <p className="mt-3 rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
              {group.empty}
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-3">
              {group.items.map((review) => (
                <li
                  key={review.id}
                  className={`rounded-xl border p-4 ${
                    group.key === "rejected"
                      ? "border-slate-200 bg-slate-50 opacity-70 dark:border-slate-800 dark:bg-slate-900"
                      : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {review.name}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <StarRating rating={review.rating} className="h-4 w-4" />
                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {t("ratingValue", { rating: review.rating })}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(review.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-300">
                    {review.comment}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {(group.key === "pending" || group.key === "rejected") && (
                      <form action={approveReview.bind(null, locale, review.id)}>
                        <button
                          type="submit"
                          className="min-h-9 rounded-full bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700"
                        >
                          {t("approve")}
                        </button>
                      </form>
                    )}

                    {group.key === "pending" && (
                      <ConfirmForm
                        action={rejectReview.bind(null, locale, review.id)}
                        confirmMessage={t("confirmReject")}
                      >
                        <button
                          type="submit"
                          className="min-h-9 rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                        >
                          {t("reject")}
                        </button>
                      </ConfirmForm>
                    )}

                    {(group.key === "approved" || group.key === "rejected") && (
                      <ConfirmForm
                        action={deleteReview.bind(null, locale, review.id)}
                        confirmMessage={t("confirmDelete")}
                      >
                        <button
                          type="submit"
                          className="min-h-9 rounded-full border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          {t("delete")}
                        </button>
                      </ConfirmForm>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  );
}
