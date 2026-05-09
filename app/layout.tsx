import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Geist } from "next/font/google";
import { cookies } from "next/headers";

import {
  SITE_DESCRIPTION,
  SITE_NAME,
  resolveCanonicalUrl,
  resolveSiteUrl,
} from "@/lib/site";
import { THEME_COOKIE_NAME, resolveTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: resolveSiteUrl(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    canonical: resolveCanonicalUrl("/"),
  },
  openGraph: {
    type: "website",
    url: resolveCanonicalUrl("/"),
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
  },
};

type RootLayoutProps = {
  children: ReactNode;
};

export default async function RootLayout({ children }: RootLayoutProps) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <html
      lang="en"
      className={cn(
        "font-sans",
        geist.variable,
        theme === "dark" ? "dark" : null,
      )}
      suppressHydrationWarning
    >
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
