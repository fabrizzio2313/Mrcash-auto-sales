"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { SETTINGS_ID } from "@/lib/settings";
import { SettingsFormSchema, type SettingsFormState } from "@/lib/definitions";

// Bound as updateSettings.bind(null, locale) in the admin settings page.
export async function updateSettings(
  locale: string,
  _prevState: SettingsFormState,
  formData: FormData
): Promise<SettingsFormState> {
  await verifySession(locale);

  const validated = SettingsFormSchema.safeParse(Object.fromEntries(formData));
  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  // Persist blanks as null so buildSite() falls back to the compiled-in
  // default for that field rather than showing an empty string.
  const data = Object.fromEntries(
    Object.entries(validated.data).map(([key, value]) => [
      key,
      typeof value === "string" && value.trim() !== "" ? value.trim() : null,
    ])
  );

  await prisma.settings.upsert({
    where: { id: SETTINGS_ID },
    update: data,
    create: { id: SETTINGS_ID, ...data },
  });

  // This info renders in the root layout (Navbar + Footer) and on the contact
  // and location pages, so refresh every cached route.
  revalidatePath("/", "layout");

  return { success: true };
}
