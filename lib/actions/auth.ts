"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSession, deleteSession } from "@/lib/auth";
import { verifySession } from "@/lib/dal";
import {
  LoginFormSchema,
  type LoginFormState,
  ChangePasswordFormSchema,
  type ChangePasswordFormState,
} from "@/lib/definitions";

// Bound with the current locale from the login form: login.bind(null, locale)
export async function login(
  locale: string,
  _prevState: LoginFormState,
  formData: FormData
): Promise<LoginFormState> {
  const validated = LoginFormSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { email, password } = validated.data;

  const user = await prisma.adminUser.findUnique({ where: { email } });
  const passwordsMatch = user
    ? await bcrypt.compare(password, user.passwordHash)
    : false;

  if (!user || !passwordsMatch) {
    return { message: "invalid-credentials" };
  }

  await createSession({ userId: user.id, email: user.email, name: user.name });
  redirect(`/${locale}/admin/dashboard`);
}

export async function logout(locale: string) {
  await deleteSession();
  redirect(`/${locale}`);
}

// Bound with the current locale from the "My Account" form:
// changePassword.bind(null, locale)
export async function changePassword(
  locale: string,
  _prevState: ChangePasswordFormState,
  formData: FormData
): Promise<ChangePasswordFormState> {
  const session = await verifySession(locale);

  const validated = ChangePasswordFormSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors };
  }

  const { currentPassword, newPassword } = validated.data;

  const user = await prisma.adminUser.findUnique({ where: { id: session.userId } });
  if (!user) {
    return { message: "not-found" };
  }

  const currentMatches = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!currentMatches) {
    return { errors: { currentPassword: ["Current password is incorrect."] } };
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.adminUser.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return { success: true };
}
