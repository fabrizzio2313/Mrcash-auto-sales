/// <reference types="react/canary" />
"use client";

import { ViewTransition } from "react";
import { usePathname } from "next/navigation";

/**
 * Soft fade/slide between public pages, using React's <ViewTransition> on top
 * of the browser View Transitions API. Keyed on the pathname so every route
 * change (including /inventory → /inventory/[slug]) swaps the content, while
 * filter/search-param updates on the same page don't. Browsers without the
 * API just navigate normally. The animation classes live in globals.css.
 */
export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <ViewTransition key={pathname} enter="page-enter" exit="page-exit" default="none">
      {children}
    </ViewTransition>
  );
}
