import { z } from "zod";

export const LoginFormSchema = z.object({
  email: z.email("Please enter a valid email."),
  password: z.string().min(1, "Password is required."),
});
export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

// Admin "My Account" — change own password. Requires the current password
// to confirm identity; the new one is hashed the same way as on signup/seed
// (see lib/actions/auth.ts).
export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z.string().min(8, "New password must be at least 8 characters."),
    confirmPassword: z.string().min(1, "Please confirm your new password."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    error: "New passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    error: "New password must be different from your current password.",
    path: ["newPassword"],
  });
export type ChangePasswordFormState =
  | {
      errors?: {
        currentPassword?: string[];
        newPassword?: string[];
        confirmPassword?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// Backs the public contact form, which creates a `Lead` (see prisma/schema.prisma).
// The visitor doesn't pick a lead `type` or `preferredDate` here — those default
// to GENERAL_INQUIRY / null — this form is just the simple "send us a message" case.
export const LeadFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  phone: z.string().trim().optional().or(z.literal("")),
  message: z.string().trim().min(10, "Message must be at least 10 characters."),
  vehicleId: z.string().optional().or(z.literal("")),
});
export type LeadFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
        message?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// Financing pre-qualification form → creates a Lead with type FINANCING.
// The extra context (income, down payment, trade-in, etc.) has no dedicated
// columns on Lead, so it's captured as free text in `message`.
export const FinancingFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  vehicleId: z.string().optional().or(z.literal("")),
  message: z.string().trim().optional().or(z.literal("")),
});
export type FinancingFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        phone?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// Schedule-a-test-drive form → creates a Lead with type TEST_DRIVE.
// `date` + `time` come from separate <input type="date">/<input type="time">
// fields and are combined into Lead.preferredDate in the Server Action.
export const TestDriveFormSchema = z.object({
  vehicleId: z.string().trim().min(1, "Please select a vehicle."),
  date: z.string().trim().min(1, "Please choose a preferred date."),
  time: z.string().trim().optional().or(z.literal("")),
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  email: z.email("Please enter a valid email."),
  phone: z.string().trim().min(7, "Enter a valid phone number."),
  message: z.string().trim().optional().or(z.literal("")),
});
export type TestDriveFormState =
  | {
      errors?: {
        vehicleId?: string[];
        date?: string[];
        name?: string[];
        email?: string[];
        phone?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

// Admin "Business Settings" — every field is optional; a blank field means
// "use the compiled-in default" (see lib/site.ts). Stored in the singleton
// `Settings` row and surfaced on the public site via getSite().
const optionalText = z.string().trim().optional().or(z.literal(""));

export const SettingsFormSchema = z.object({
  businessName: optionalText,
  phoneDisplay: optionalText,
  phoneE164: optionalText,
  whatsappE164: optionalText,
  email: z.union([z.literal(""), z.email("Please enter a valid email address.")]).optional(),
  notificationEmail: z
    .union([z.literal(""), z.email("Please enter a valid email address.")])
    .optional(),
  addressLine1: optionalText,
  addressLine2: optionalText,
  hoursWeekdays: optionalText,
  hoursSaturday: optionalText,
  hoursSunday: optionalText,
  facebookUrl: z
    .union([z.literal(""), z.url("Please enter a valid URL (https://…).")])
    .optional(),
});
export type SettingsFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
      success?: boolean;
    }
  | undefined;

// Public "leave a review" form → creates a Review with status PENDING
// (see prisma/schema.prisma). The review isn't shown publicly until an admin
// approves it at /admin/reviews.
export const ReviewFormSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters."),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Please select a rating.")
    .max(5, "Please select a rating."),
  comment: z.string().trim().min(10, "Your review must be at least 10 characters."),
});
export type ReviewFormState =
  | {
      errors?: {
        name?: string[];
        rating?: string[];
        comment?: string[];
      };
      message?: string;
      success?: boolean;
    }
  | undefined;

export const VehicleStatusEnum = z.enum(["AVAILABLE", "PENDING", "SOLD"]);
export const FuelTypeEnum = z.enum(["GASOLINE", "DIESEL", "HYBRID", "ELECTRIC"]);
export const TransmissionEnum = z.enum(["AUTOMATIC", "MANUAL"]);

export const VehicleFormSchema = z.object({
  make: z.string().trim().min(1, "Make is required."),
  model: z.string().trim().min(1, "Model is required."),
  year: z.coerce
    .number()
    .int()
    .min(1900, "Enter a valid year.")
    .max(new Date().getFullYear() + 1, "Enter a valid year."),
  trim: z.string().trim().optional().or(z.literal("")),
  bodyType: z.string().trim().optional().or(z.literal("")),
  price: z.coerce.number().int().min(0, "Price must be positive."),
  onSale: z.coerce.boolean().optional(),
  // Kept as a plain string (not z.coerce.number()) because Number("") is 0,
  // not NaN — coercing directly would turn "left blank" into originalPrice: 0
  // instead of "no original price". Parsed to a number (or null) in the
  // Server Action instead, see lib/actions/vehicles.ts.
  originalPrice: z.string().trim().optional().or(z.literal("")),
  mileage: z.coerce.number().int().min(0, "Mileage must be positive."),
  vin: z.string().trim().optional().or(z.literal("")),
  stockNumber: z.string().trim().optional().or(z.literal("")),
  color: z.string().trim().optional().or(z.literal("")),
  fuelType: FuelTypeEnum,
  transmission: TransmissionEnum,
  status: VehicleStatusEnum,
  featured: z.coerce.boolean().optional(),
  description: z.string().trim().optional().or(z.literal("")),
  features: z.string().trim().optional().or(z.literal("")), // newline-separated list
  photos: z.string().trim().optional().or(z.literal("")), // newline-separated URLs
});
export type VehicleFormState =
  | {
      errors?: Record<string, string[]>;
      message?: string;
    }
  | undefined;
