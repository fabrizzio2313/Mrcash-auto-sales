import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSite } from "@/lib/settings";

export default async function Footer() {
  const t = await getTranslations("footer");
  const tNav = await getTranslations("nav");
  const tContact = await getTranslations("contact");
  const site = await getSite();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            Mr. Cash Auto Sales
          </p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{t("tagline")}</p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("quickLinks")}
          </h3>
          <ul className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            <li>
              <Link href="/inventory" className="block py-1.5 hover:text-blue-600">
                {tNav("inventory")}
              </Link>
            </li>
            <li>
              <Link href="/financing" className="block py-1.5 hover:text-blue-600">
                {tNav("financing")}
              </Link>
            </li>
            <li>
              <Link href="/test-drive" className="block py-1.5 hover:text-blue-600">
                {tNav("testDrive")}
              </Link>
            </li>
            <li>
              <Link href="/about" className="block py-1.5 hover:text-blue-600">
                {tNav("about")}
              </Link>
            </li>
            <li>
              <Link href="/faq" className="block py-1.5 hover:text-blue-600">
                {tNav("faq")}
              </Link>
            </li>
            <li>
              <Link href="/reviews" className="block py-1.5 hover:text-blue-600">
                {tNav("reviews")}
              </Link>
            </li>
            <li>
              <Link href="/location" className="block py-1.5 hover:text-blue-600">
                {tNav("location")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="block py-1.5 hover:text-blue-600">
                {tNav("contact")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t("contactUs")}
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
            <li>{tContact("address")}: {site.address.full}</li>
            <li>{tContact("phoneLabel")}: {site.phoneDisplay}</li>
            <li>{tContact("emailLabel")}: {site.email}</li>
            {site.facebookUrl && (
              <li>
                <a
                  href={site.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block py-1 hover:text-blue-600"
                >
                  {t("facebook")}
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500">
        © {year} Mr. Cash Auto Sales. {t("rights")}
      </div>
    </footer>
  );
}
