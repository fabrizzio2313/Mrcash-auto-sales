"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifySession } from "@/lib/dal";
import { getSettings } from "@/lib/settings";
import { sendLeadNotification, type LeadNotification } from "@/lib/email";
import {
  LeadFormSchema,
  type LeadFormState,
  FinancingFormSchema,
  type FinancingFormState,
  TestDriveFormSchema,
  type TestDriveFormState,
} from "@/lib/definitions";
import type { Lead, LeadStatus, Vehicle } from "@/lib/generated/prisma/client";

// Fire off the "new lead" email after the response is sent, so a slow (or
// misconfigured) mail provider never delays the visitor's form submission.
// sendLeadNotification swallows its own errors and no-ops when the panel has
// no notification address set or RESEND_API_KEY is missing.
function notifyNewLead(lead: Lead & { vehicle: Vehicle | null }) {
  after(async () => {
    const settings = await getSettings();
    const payload: LeadNotification = {
      type: lead.type,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      message: lead.message,
      preferredDate: lead.preferredDate,
      vehicle: lead.vehicle
        ? `${lead.vehicle.year} ${lead.vehicle.make} ${lead.vehicle.model}`
        : null,
    };
    await sendLeadNotification(settings?.notificationEmail, payload);
  });
}

// Public contact form → creates a Lead with the default type
// (GENERAL_INQUIRY) and status (NEW). See prisma/schema.prisma.
export async function submitContactForm(
  _prevState: LeadFormState,
  formData: FormData
): Promise<LeadFormState> {
  const validated = LeadFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
    // The plain /contact page renders no vehicleId field, so `.get` returns
    // null there — normalize to undefined so the optional schema accepts it.
    vehicleId: formData.get("vehicleId") ?? undefined,
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, phone, message, vehicleId } = validated.data;

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone: phone || null,
      message: message || null,
      vehicleId: vehicleId || null,
    },
    include: { vehicle: true },
  });

  notifyNewLead(lead);

  return { success: true };
}

export async function submitFinancingForm(
  _prevState: FinancingFormState,
  formData: FormData
): Promise<FinancingFormState> {
  const validated = FinancingFormSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    vehicleId: formData.get("vehicleId") ?? undefined,
    message: formData.get("message"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, phone, vehicleId, message } = validated.data;

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      type: "FINANCING",
      vehicleId: vehicleId || null,
      message: message || null,
    },
    include: { vehicle: true },
  });

  notifyNewLead(lead);

  return { success: true };
}

export async function submitTestDriveForm(
  _prevState: TestDriveFormState,
  formData: FormData
): Promise<TestDriveFormState> {
  const validated = TestDriveFormSchema.safeParse({
    vehicleId: formData.get("vehicleId"),
    date: formData.get("date"),
    time: formData.get("time"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    message: formData.get("message"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { vehicleId, date, time, name, email, phone, message } = validated.data;

  const preferredDate = new Date(`${date}T${time || "10:00"}`);
  if (Number.isNaN(preferredDate.getTime())) {
    return { message: "invalid-date" };
  }

  const lead = await prisma.lead.create({
    data: {
      name,
      email,
      phone,
      type: "TEST_DRIVE",
      vehicleId,
      preferredDate,
      message: message || null,
    },
    include: { vehicle: true },
  });

  notifyNewLead(lead);

  return { success: true };
}

// Bound as updateLeadStatus.bind(null, locale, leadId, "NEW" | "CONTACTED" | "CLOSED")
// and wired to one-click status buttons in MessagesTable — every status is
// reachable directly from every other (no forward-only restriction).
export async function updateLeadStatus(
  locale: string,
  id: string,
  status: LeadStatus
) {
  await verifySession(locale);
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath(`/${locale}/admin/messages`);
}
