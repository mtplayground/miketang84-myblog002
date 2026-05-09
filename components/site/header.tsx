import Link from "next/link";

import { ThemeToggle } from "@/components/site/theme-toggle";
import { buttonVariants } from "@/components/ui/button";
import { type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

type SiteHeaderProps = {
  theme: Theme;
};

const navLinks = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/about",
    label: "About",
  },
  {
    href: "/admin/login",
    label: "Admin",
  },
] as const;

export function SiteHeader({ theme }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-stone-300/65 bg-white/78 backdrop-blur dark:border-white/10 dark:bg-stone-950/72">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link className="flex flex-col gap-1" href="/">
          <span className="text-[0.72rem] font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
            Public
          </span>
          <span className="text-lg font-semibold tracking-tight text-stone-950 dark:text-stone-50">
            myblog002
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <nav className="hidden items-center gap-2 sm:flex">
            {navLinks.map((link) => (
              <Link
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  }),
                  "rounded-full",
                )}
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <ThemeToggle initialTheme={theme} />
        </div>
      </div>
    </header>
  );
}
