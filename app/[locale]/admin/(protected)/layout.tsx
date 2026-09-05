import type { Metadata } from "next";
import { verifySession } from "@/lib/dal";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata: Metadata = {
  title: { template: "%s | Admin", default: "Admin" },
  robots: { index: false, follow: false },
};

export default async function ProtectedAdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Proxy already redirects unauthenticated requests away from /admin/*
  // (optimistic check). This is the real, secure check close to the data —
  // see lib/dal.ts.
  await verifySession(locale);

  return (
    <div className="flex min-h-screen flex-col sm:flex-row">
      <AdminSidebar locale={locale} />
      <main className="flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
