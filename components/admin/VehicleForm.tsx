"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import type { VehicleFormState } from "@/lib/definitions";
import type { Vehicle, Photo } from "@/lib/generated/prisma/client";
import PhotoManager from "@/components/admin/PhotoManager";

type VehicleAction = (
  state: VehicleFormState,
  formData: FormData
) => Promise<VehicleFormState>;

export default function VehicleForm({
  action,
  vehicle,
}: {
  action: VehicleAction;
  vehicle?: Vehicle & { photos: Photo[] };
}) {
  const t = useTranslations("admin.form");
  const tVehicle = useTranslations("vehicle");
  const [state, formAction, pending] = useActionState<VehicleFormState, FormData>(
    action,
    undefined
  );

  const errors = state?.errors ?? {};
  const initialPhotoUrls = vehicle?.photos.map((p) => p.url) ?? [];

  return (
    <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Field label={t("make")} name="make" defaultValue={vehicle?.make} error={errors.make} required />
      <Field label={t("model")} name="model" defaultValue={vehicle?.model} error={errors.model} required />
      <Field
        label={t("year")}
        name="year"
        type="number"
        defaultValue={vehicle?.year}
        error={errors.year}
        required
      />
      <Field label={t("trim")} name="trim" defaultValue={vehicle?.trim ?? ""} error={errors.trim} />
      <Field label={t("bodyType")} name="bodyType" defaultValue={vehicle?.bodyType ?? ""} error={errors.bodyType} />
      <Field label={t("stockNumber")} name="stockNumber" defaultValue={vehicle?.stockNumber ?? ""} error={errors.stockNumber} />

      <Field
        label={t("price")}
        name="price"
        type="number"
        defaultValue={vehicle?.price}
        error={errors.price}
        required
      />
      <Field
        label={t("originalPrice")}
        name="originalPrice"
        type="number"
        defaultValue={vehicle?.originalPrice ?? ""}
        error={errors.originalPrice}
      />
      <label className="flex min-h-11 items-center gap-2.5 self-end pb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          name="onSale"
          defaultChecked={vehicle?.onSale}
          className="h-5 w-5 rounded border-slate-300"
        />
        {t("onSale")}
      </label>

      <Field
        label={t("mileage")}
        name="mileage"
        type="number"
        defaultValue={vehicle?.mileage}
        error={errors.mileage}
        required
      />
      <Field label={t("vin")} name="vin" defaultValue={vehicle?.vin ?? ""} error={errors.vin} />
      <Field label={t("color")} name="color" defaultValue={vehicle?.color ?? ""} error={errors.color} />

      <div>
        <label htmlFor="fuelType" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("fuelType")}
        </label>
        <select
          id="fuelType"
          name="fuelType"
          defaultValue={vehicle?.fuelType ?? "GASOLINE"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="GASOLINE">{tVehicle("fuel.GASOLINE")}</option>
          <option value="DIESEL">{tVehicle("fuel.DIESEL")}</option>
          <option value="HYBRID">{tVehicle("fuel.HYBRID")}</option>
          <option value="ELECTRIC">{tVehicle("fuel.ELECTRIC")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="transmission" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("transmission")}
        </label>
        <select
          id="transmission"
          name="transmission"
          defaultValue={vehicle?.transmission ?? "AUTOMATIC"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="AUTOMATIC">{tVehicle("transmissionType.AUTOMATIC")}</option>
          <option value="MANUAL">{tVehicle("transmissionType.MANUAL")}</option>
        </select>
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("status")}
        </label>
        <select
          id="status"
          name="status"
          defaultValue={vehicle?.status ?? "AVAILABLE"}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        >
          <option value="AVAILABLE">{tVehicle("statusAvailable")}</option>
          <option value="PENDING">{tVehicle("statusPending")}</option>
          <option value="SOLD">{tVehicle("statusSold")}</option>
        </select>
      </div>

      <label className="flex min-h-11 items-center gap-2.5 self-end pb-2 text-sm font-medium text-slate-700 dark:text-slate-200">
        <input
          type="checkbox"
          name="featured"
          defaultChecked={vehicle?.featured}
          className="h-5 w-5 rounded border-slate-300"
        />
        {t("featured")}
      </label>

      <div className="sm:col-span-2">
        <label htmlFor="description" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("description")}
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={vehicle?.description ?? ""}
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="features" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
          {t("features")}
        </label>
        <textarea
          id="features"
          name="features"
          rows={3}
          defaultValue={vehicle?.features ?? ""}
          placeholder="Bluetooth&#10;Backup Camera&#10;Sunroof"
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
        />
      </div>

      <PhotoManager initialUrls={initialPhotoUrls} />

      {state?.message && (
        <p className="text-sm text-red-600 sm:col-span-2">{state.message}</p>
      )}

      <div className="flex gap-3 sm:col-span-2">
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

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  error,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string | number | null;
  error?: string[];
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={defaultValue ?? ""}
        required={required}
        className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm dark:border-slate-700 dark:bg-slate-800"
      />
      {error && <p className="mt-1 text-sm text-red-600">{error[0]}</p>}
    </div>
  );
}
