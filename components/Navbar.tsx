import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { getSite } from "@/lib/settings";
import { PhoneIcon, MessageIcon, WhatsAppIcon, CalendarIcon, CreditCardIcon } from "@/components/icons";

export default async function Navbar() {
  const t = await getTranslations("nav");
  const tCta = await getTranslations("cta");
  const site = await getSite();

  return (
    <header className="sticky top-0 z-40 bg-[#0b1a33]">
      {/* CTA strip — the 5 always-visible actions: Call, Text, WhatsApp,
          Schedule Test Drive, Apply for Financing. */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-1.5 px-4 py-1.5 sm:gap-2 sm:py-2 sm:justify-end sm:px-6">
          <a
            href={site.phoneHref}
            title={`${tCta("call")}: ${site.phoneDisplay}`}
            className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full p-2 text-slate-200 hover:bg-white/10 hover:text-amber-400 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5"
          >
            <PhoneIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden text-xs font-medium sm:inline">{tCta("call")}</span>
          </a>
          <a
            href={site.smsHref}
            title={tCta("text")}
            className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full p-2 text-slate-200 hover:bg-white/10 hover:text-amber-400 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5"
          >
            <MessageIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden text-xs font-medium sm:inline">{tCta("text")}</span>
          </a>
          <a
            href={site.whatsappHref(tCta("whatsappMessage"))}
            target="_blank"
            rel="noopener noreferrer"
            title={tCta("whatsapp")}
            className="flex min-h-11 min-w-11 items-center justify-center gap-1.5 rounded-full p-2 text-slate-200 hover:bg-white/10 hover:text-amber-400 sm:min-h-0 sm:min-w-0 sm:px-3 sm:py-1.5"
          >
            <WhatsAppIcon className="h-5 w-5 sm:h-4 sm:w-4" />
            <span className="hidden text-xs font-medium sm:inline">{tCta("whatsapp")}</span>
          </a>
          <Link
            href="/test-drive"
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-white/10 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/20 sm:min-h-0 sm:py-1.5"
          >
            <CalendarIcon className="h-4 w-4" />
            {t("testDrive")}
          </Link>
          <Link
            href="/financing"
            className="flex min-h-11 items-center gap-1.5 rounded-full bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-900 hover:bg-amber-300 sm:min-h-0 sm:py-1.5"
          >
            <CreditCardIcon className="h-4 w-4" />
            {t("financing")}
          </Link>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-1.5 sm:px-6">
        <Link href="/" className="shrink-0 py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt="Mr. Cash Auto Sales"
            className="h-16 w-auto sm:h-24"
          />
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-200 sm:flex">
          <Link href="/" className="hover:text-amber-400">
            {t("home")}
          </Link>
          <Link href="/inventory" className="hover:text-amber-400">
            {t("inventory")}
          </Link>
          <Link href="/about" className="hover:text-amber-400">
            {t("about")}
          </Link>
          <Link href="/faq" className="hover:text-amber-400">
            {t("faq")}
          </Link>
          <Link href="/reviews" className="hover:text-amber-400">
            {t("reviews")}
          </Link>
          <Link href="/location" className="hover:text-amber-400">
            {t("location")}
          </Link>
          <Link href="/contact" className="hover:text-amber-400">
            {t("contact")}
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <LanguageSwitcher />
          <Link
            href="/admin/login"
            className="hidden rounded-lg border border-slate-600 px-3 py-1.5 text-sm font-medium text-slate-200 hover:border-amber-400 hover:text-amber-400 sm:block"
          >
            {t("admin")}
          </Link>
        </div>
      </div>

      <nav className="no-scrollbar flex items-center gap-1 overflow-x-auto border-t border-white/10 px-2 py-1 text-sm font-medium text-slate-200 sm:hidden">
        <Link href="/" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("home")}
        </Link>
        <Link href="/inventory" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("inventory")}
        </Link>
        <Link href="/about" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("about")}
        </Link>
        <Link href="/faq" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("faq")}
        </Link>
        <Link href="/reviews" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("reviews")}
        </Link>
        <Link href="/location" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("location")}
        </Link>
        <Link href="/contact" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("contact")}
        </Link>
        <Link href="/admin/login" className="whitespace-nowrap rounded-lg px-3 py-2 hover:bg-white/10 hover:text-amber-400">
          {t("admin")}
        </Link>
      </nav>
    </header>
  );
}
