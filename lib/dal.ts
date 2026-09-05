import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

/**
 * Verifies the admin session for the current request. Memoized per-request
 * with React's `cache` so calling it from multiple components/layouts only
 * decrypts the cookie once.
 *
 * Proxy (proxy.ts) already performs an optimistic redirect for unauthenticated
 * requests to /admin/*, but every Server Action and data-loading function
 * that touches admin data must call this too — proxy is not a substitute for
 * real authorization checks close to the data.
 */
export const verifySession = cache(async (locale: string) => {
  const session = await getSession();
  if (!session?.userId) {
    redirect(`/${locale}/admin/login`);
  }
  return session;
});
