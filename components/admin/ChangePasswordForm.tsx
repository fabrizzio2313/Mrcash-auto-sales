"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { changePassword } from "@/lib/actions/auth";
import type { ChangePasswordFormState } from "@/lib/definitions";

export default function ChangePasswordForm({ locale }: { locale: string }) {
  const t = useTranslations("admin.account");
  const changePasswordWithLocale = changePassword.bind(null, locale);
  const [state, action, pending] = useActionState<ChangePasswordFormState, FormData>(
    changePasswordWithLocale,
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
      <div>
        <label htmlFor="currentPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("currentPassword")}
        </label>
        <input
          id="currentPassword"
          name="currentPassword"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.currentPassword && (
          <p className="mt-1 text-sm text-red-600">{state.errors.currentPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("newPassword")}
        </label>
        <input
          id="newPassword"
          name="newPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.newPassword && (
          <p className="mt-1 text-sm text-red-600">{state.errors.newPassword[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("confirmPassword")}
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{state.errors.confirmPassword[0]}</p>
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
