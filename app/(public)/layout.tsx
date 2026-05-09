import type { ReactNode } from "react";

import { cookies } from "next/headers";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import { THEME_COOKIE_NAME, resolveTheme } from "@/lib/theme";

type PublicLayoutProps = {
  children: ReactNode;
};

export default async function PublicLayout({ children }: PublicLayoutProps) {
  const cookieStore = await cookies();
  const theme = resolveTheme(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <div className="relative min-h-screen">
      <SiteHeader theme={theme} />
      <main>{children}</main>
      <SiteFooter />
    </div>
  );
}

