"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { SettingsFormState } from "@/lib/definitions";
import type { SiteDefaults } from "@/lib/site";
import type { Settings } from "@/lib/generated/prisma/client";

type SettingsAction = (
  state: SettingsFormState,
  formData: FormData
) => Promise<SettingsFormState>;

// Keys shared by the DB row, the defaults object and the form fields.
type FieldName =
  | "businessName"
  | "phoneDisplay"
  | "phoneE164"
  | "whatsappE164"
  | "email"
  | "notificationEmail"
  | "addressLine1"
  | "addressLine2"
  | "hoursWeekdays"
  | "hoursSaturday"
  | "hoursSunday"
  | "facebookUrl";

// Which SITE_DEFAULTS key backs each field's placeholder (fields with no
// compiled-in default, like notificationEmail, are left out).
const DEFAULT_KEY: Partial<Record<FieldName, keyof SiteDefaults>> = {
  businessName: "name",
  phoneDisplay: "phoneDisplay",
  phoneE164: "phoneE164",
  whatsappE164: "whatsappE164",
  email: "email",
  addressLine1: "addressLine1",
  addressLine2: "addressLine2",
  hoursWeekdays: "hoursWeekdays",
  hoursSaturday: "hoursSaturday",
  hoursSunday: "hoursSunday",
  facebookUrl: "facebookUrl",
};

export default function SettingsForm({
  action,
  settings,
  defaults,
}: {
  action: SettingsAction;
  settings: Settings | null;
  defaults: SiteDefaults;
}) {
  const t = useTranslations("admin.settings");
  const [state, formAction, pending] = useActionState<SettingsFormState, FormData>(
    action,
    undefined
  );

  const errors = state?.errors ?? {};

  function fieldValue(name: FieldName): string {
    const v = settings?.[name];
    return typeof v === "string" ? v : "";
  }

  function placeholder(name: FieldName): string {
    const key = DEFAULT_KEY[name];
    return key ? defaults[key] || "" : "";
  }

  return (
    <form action={formAction} className="flex flex-col gap-8">
      {state?.success && (
        <p className="rounded-lg border border-green-300 bg-green-50 p-4 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
          {t("success")}
        </p>
      )}

      <Section title={t("sectionBusiness")}>
        <Field
          label={t("businessName")}
          name="businessName"
          defaultValue={fieldValue("businessName")}
          placeholder={placeholder("businessName")}
          error={errors.businessName}
        />
      </Section>

      <Section title={t("sectionContact")} hint={t("e164Hint")}>
        <Field
          label={t("phoneDisplay")}
          name="phoneDisplay"
          defaultValue={fieldValue("phoneDisplay")}
          placeholder={placeholder("phoneDisplay")}
          error={errors.phoneDisplay}
        />
        <Field
          label={t("phoneE164")}
          name="phoneE164"
          type="tel"
          defaultValue={fieldValue("phoneE164")}
          placeholder={placeholder("phoneE164")}
          error={errors.phoneE164}
        />
        <Field
          label={t("whatsappE164")}
          name="whatsappE164"
          type="tel"
          defaultValue={fieldValue("whatsappE164")}
          placeholder={placeholder("whatsappE164")}
          error={errors.whatsappE164}
        />
        <Field
          label={t("email")}
          name="email"
          type="email"
          defaultValue={fieldValue("email")}
          placeholder={placeholder("email")}
          error={errors.email}
        />
      </Section>

      <Section title={t("sectionAddress")}>
        <Field
          label={t("addressLine1")}
          name="addressLine1"
          defaultValue={fieldValue("addressLine1")}
          placeholder={placeholder("addressLine1")}
          error={errors.addressLine1}
        />
        <Field
          label={t("addressLine2")}
          name="addressLine2"
          defaultValue={fieldValue("addressLine2")}
          placeholder={placeholder("addressLine2")}
          error={errors.addressLine2}
        />
      </Section>

      <Section title={t("sectionHours")}>
        <Field
          label={t("hoursWeekdays")}
          name="hoursWeekdays"
          defaultValue={fieldValue("hoursWeekdays")}
          placeholder={placeholder("hoursWeekdays")}
          error={errors.hoursWeekdays}
        />
        <Field
          label={t("hoursSaturday")}
          name="hoursSaturday"
          defaultValue={fieldValue("hoursSaturday")}
          placeholder={placeholder("hoursSaturday")}
          error={errors.hoursSaturday}
        />
        <Field
          label={t("hoursSunday")}
          name="hoursSunday"
          defaultValue={fieldValue("hoursSunday")}
          placeholder={placeholder("hoursSunday")}
          error={errors.hoursSunday}
        />
      </Section>

      <Section title={t("sectionSocial")}>
        <Field
          label={t("facebookUrl")}
          name="facebookUrl"
          type="url"
          defaultValue={fieldValue("facebookUrl")}
          placeholder="https://facebook.com/yourpage"
          error={errors.facebookUrl}
        />
      </Section>

      <Section title={t("sectionNotifications")} hint={t("notificationEmailHint")}>
        <Field
          label={t("notificationEmail")}
          name="notificationEmail"
          type="email"
          defaultValue={fieldValue("notificationEmail")}
          placeholder="leads@example.com"
          error={errors.notificationEmail}
        />
      </Section>

      {state?.message && (
        <p className="text-sm text-red-600">{t("error")}</p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {pending ? t("saving") : t("save")}
        </button>
      </div>
    </form>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {title}
      </legend>
      {hint && <p className="-mt-2 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  placeholder,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  placeholder?: string;
  error?: string[];
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error[0]}</p>}
    </div>
  );
}
