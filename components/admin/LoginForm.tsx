"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { login } from "@/lib/actions/auth";
import type { LoginFormState } from "@/lib/definitions";

export default function LoginForm({ locale }: { locale: string }) {
  const t = useTranslations("admin.login");
  const loginWithLocale = login.bind(null, locale);
  const [state, action, pending] = useActionState<LoginFormState, FormData>(
    loginWithLocale,
    undefined
  );

  return (
    <form action={action} className="flex flex-col gap-4">
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
        <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("password")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
        {state?.errors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.errors.password[0]}</p>
        )}
      </div>

      {state?.message === "invalid-credentials" && (
        <p className="text-sm text-red-600">{t("error")}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-200"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
