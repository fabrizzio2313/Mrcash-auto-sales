"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { submitTestDriveForm } from "@/lib/actions/leads";
import type { TestDriveFormState } from "@/lib/definitions";
import type { Vehicle } from "@/lib/generated/prisma/client";

export default function TestDriveForm({
  vehicles,
  vehicleId,
}: {
  vehicles: Vehicle[];
  vehicleId?: string;
}) {
  const t = useTranslations("testDrive");
  const [state, action, pending] = useActionState<TestDriveFormState, FormData>(
    submitTestDriveForm,
    undefined
  );

  if (state?.success) {
    return (
      <p className="rounded-lg border border-green-300 bg-green-50 p-4 text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
        {t("success")}
      </p>
    );
  }

  const today = new Date().toISOString().split("T")[0];

  return (
    <form action={action} className="flex flex-col gap-4">
      <div>
        <label htmlFor="vehicleId" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("vehicleLabel")}
        </label>
        <select
          id="vehicleId"
          name="vehicleId"
          required
          defaultValue={vehicleId ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="" disabled>
            {t("selectVehicle")}
          </option>
          {vehicles.map((v) => (
            <option key={v.id} value={v.id}>
              {v.year} {v.make} {v.model} — ${v.price.toLocaleString()}
            </option>
          ))}
        </select>
        {state?.errors?.vehicleId && (
          <p className="mt-1 text-sm text-red-600">{state.errors.vehicleId[0]}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("date")}
          </label>
          <input
            id="date"
            name="date"
            type="date"
            min={today}
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          {state?.errors?.date && <p className="mt-1 text-sm text-red-600">{state.errors.date[0]}</p>}
        </div>
        <div>
          <label htmlFor="time" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("time")}
          </label>
          <input
            id="time"
            name="time"
            type="time"
            defaultValue="10:00"
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
        </div>
      </div>

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
        {state?.errors?.name && <p className="mt-1 text-sm text-red-600">{state.errors.name[0]}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
          {state?.errors?.email && <p className="mt-1 text-sm text-red-600">{state.errors.email[0]}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
            {t("phone")}
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
          />
          {state?.errors?.phone && <p className="mt-1 text-sm text-red-600">{state.errors.phone[0]}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("message")}
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      {state?.message && <p className="text-sm text-red-600">{t("error")}</p>}

      <button
        type="submit"
        disabled={pending}
        className="min-h-11 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-60"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
    </form>
  );
}
