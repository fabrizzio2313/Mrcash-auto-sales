"use client";

import { useState } from "react";
import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitReview } from "@/lib/actions/reviews";
import type { ReviewFormState } from "@/lib/definitions";

function StarInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          aria-label={`${n} ${n === 1 ? "star" : "stars"}`}
          aria-pressed={value === n}
          className="p-1 text-amber-500"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-8 w-8"
            fill={n <= active ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.6"
            aria-hidden="true"
          >
            <path
              d="m12 3.5 2.6 5.3 5.9.9-4.2 4.1 1 5.9-5.3-2.8-5.3 2.8 1-5.9L4.5 9.7l5.9-.9L12 3.5Z"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

export default function ReviewForm() {
  const t = useTranslations("reviews");
  const [rating, setRating] = useState(0);
  const [state, action, pending] = useActionState<ReviewFormState, FormData>(
    submitReview,
    undefined
  );

  if (state?.success) {
    return (
      <p className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
        {t("success")}
      </p>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <input type="hidden" name="rating" value={rating || ""} />

      <div>
        <label
          htmlFor="review-name"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {t("name")}
        </label>
        <input
          id="review-name"
          name="name"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("rating")}
        </span>
        <StarInput value={rating} onChange={setRating} />
        {state?.errors?.rating && (
          <p className="mt-1 text-sm text-red-600">{state.errors.rating[0]}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="review-comment"
          className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
        >
          {t("comment")}
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={4}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.comment && (
          <p className="mt-1 text-sm text-red-600">{state.errors.comment[0]}</p>
        )}
      </div>

      {state?.message && <p className="text-sm text-red-600">{t("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
