import { NextResponse, type NextRequest } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { decrypt } from "@/lib/session";

// Next.js 16 renamed `middleware.ts` to `proxy.ts` (same functionality).
// This file combines next-intl's locale routing with an *optimistic*
// admin-auth check, since only one proxy file is allowed per project.

const handleI18nRouting = createIntlMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const segments = pathname.split("/").filter(Boolean);

  const firstSegment = segments[0];
  const localeInPath = (routing.locales as readonly string[]).includes(
    firstSegment
  )
    ? firstSegment
    : undefined;
  const locale = localeInPath ?? routing.defaultLocale;
  const rest = localeInPath ? segments.slice(1) : segments;

  const isAdminRoute = rest[0] === "admin";
  const isLoginRoute = isAdminRoute && rest[1] === "login";

  if (isAdminRoute) {
    const sessionCookie = request.cookies.get("session")?.value;
    const session = await decrypt(sessionCookie);
    const isAuthed = Boolean(session?.userId);

    if (!isLoginRoute && !isAuthed) {
      return NextResponse.redirect(
        new URL(`/${locale}/admin/login`, request.url)
      );
    }

    if (isLoginRoute && isAuthed) {
      return NextResponse.redirect(
        new URL(`/${locale}/admin/dashboard`, request.url)
      );
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Skip API routes, Next internals, and files with an extension (e.g. favicon.ico).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
