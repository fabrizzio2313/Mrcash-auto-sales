"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitContactForm } from "@/lib/actions/leads";
import type { LeadFormState } from "@/lib/definitions";

export default function ContactForm({ vehicleId }: { vehicleId?: string }) {
  const t = useTranslations("contact");
  const [state, action, pending] = useActionState<LeadFormState, FormData>(
    submitContactForm,
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
      {vehicleId && <input type="hidden" name="vehicleId" value={vehicleId} />}

      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("name")}
        </label>
        <input
          id="name"
          name="name"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("email")}
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("phone")}
        </label>
        <input
          id="phone"
          name="phone"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.message && (
          <p className="mt-1 text-sm text-red-600">{state.errors.message[0]}</p>
        )}
      </div>

      {state?.message && (
        <p className="text-sm text-red-600">{t("error")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
      >
        {pending ? t("sending") : t("send")}
      </button>
    </form>
  );
}
