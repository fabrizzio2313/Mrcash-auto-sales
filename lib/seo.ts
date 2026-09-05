import { routing } from "@/i18n/routing";
import { site } from "@/lib/site";

/**
 * Builds the `alternates` field for a page's Metadata: a canonical URL plus
 * hreflang links to every locale version of the same path, so search engines
 * know the /en and /es pages are translations of each other rather than
 * duplicate content.
 *
 * `path` is the locale-free path, e.g. "/inventory" or "/inventory/2022-honda-civic-lx".
 */
export function buildAlternates(locale: string, path: string) {
  const languages: Record<string, string> = {};
  for (const loc of routing.locales) {
    languages[loc] = `${site.url}/${loc}${path}`;
  }
  languages["x-default"] = `${site.url}/${routing.defaultLocale}${path}`;

  return {
    canonical: `${site.url}/${locale}${path}`,
    languages,
  };
}

/**
 * Safely serializes a JSON-LD object for embedding in a
 * <script type="application/ld+json"> tag. Escapes "<" so the payload can't
 * break out of the script element (e.g. via a description containing
 * "</script>").
 */
export function jsonLdScriptProps(data: unknown) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: json },
  };
}
