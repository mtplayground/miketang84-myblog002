import type { Metadata } from "next";
import type { ReactNode } from "react";

import { Geist } from "next/font/google";
import { cookies } from "next/headers";

import { THEME_COOKIE_NAME, resolveTheme } from "@/lib/theme";
import { cn } from "@/lib/utils";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "myblog002",
  description: "A self-hosted blog built with Next.js 15.",
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
