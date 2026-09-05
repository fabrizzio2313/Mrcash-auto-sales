import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getSite } from "@/lib/settings";
import { PhoneIcon, MessageIcon, WhatsAppIcon, CalendarIcon, CreditCardIcon } from "@/components/icons";

/**
 * The 5 prominent conversion actions, reused on the home hero and on each
 * vehicle detail page (where `vehicleId` pre-fills the Test Drive /
 * Financing forms and personalizes the WhatsApp message).
 */
export default async function CtaButtons({ vehicleId }: { vehicleId?: string }) {
  const t = await getTranslations("cta");
  const site = await getSite();

  const whatsappMessage = vehicleId
    ? t("whatsappMessageVehicle", { vehicleId })
    : t("whatsappMessage");

  const testDriveHref = vehicleId ? `/test-drive?vehicleId=${vehicleId}` : "/test-drive";
  const financingHref = vehicleId ? `/financing?vehicleId=${vehicleId}` : "/financing";

  return (
    <div className="flex w-full flex-col gap-2.5 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3">
      <a
        href={site.phoneHref}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100 sm:justify-start sm:py-2.5"
      >
        <PhoneIcon className="h-4 w-4" />
        {t("call")}
      </a>
      <a
        href={site.smsHref}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:justify-start sm:py-2.5"
      >
        <MessageIcon className="h-4 w-4" />
        {t("text")}
      </a>
      <a
        href={site.whatsappHref(whatsappMessage)}
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-white/40 px-4 py-3 text-sm font-semibold text-white hover:bg-white/10 sm:justify-start sm:py-2.5"
      >
        <WhatsAppIcon className="h-4 w-4" />
        {t("whatsapp")}
      </a>
      <Link
        href={testDriveHref}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 sm:justify-start sm:py-2.5"
      >
        <CalendarIcon className="h-4 w-4" />
        {t("scheduleTestDrive")}
      </Link>
      <Link
        href={financingHref}
        className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-amber-400 px-4 py-3 text-sm font-semibold text-slate-900 hover:bg-amber-300 sm:justify-start sm:py-2.5"
      >
        <CreditCardIcon className="h-4 w-4" />
        {t("applyFinancing")}
      </Link>
    </div>
  );
}
