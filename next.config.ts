import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  // Vehicle photos are arbitrary admin-entered URLs, rendered with a plain
  // <img> tag rather than next/image (which requires an allowlisted host).

  // Allow loading `next dev` HMR resources when the site is opened from
  // another device on the LAN (e.g. testing the mobile layout on a phone).
  allowedDevOrigins: ["192.168.4.27"],
};

export default withNextIntl(nextConfig);
