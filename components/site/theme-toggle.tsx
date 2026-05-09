"use client";

import { useEffect, useState, useTransition } from "react";

import { MoonStar, SunMedium } from "lucide-react";
import { useRouter } from "next/navigation";

import { THEME_COOKIE_NAME, type Theme } from "@/lib/theme";

type ThemeToggleProps = {
  initialTheme: Theme;
};

function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle("dark", theme === "dark");
}

function persistTheme(theme: Theme) {
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=31536000; samesite=lax`;
}

export function ThemeToggle({ initialTheme }: ThemeToggleProps) {
  const [theme, setTheme] = useState<Theme>(initialTheme);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  useEffect(() => {
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, [initialTheme]);

  const nextTheme = theme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label={`Switch to ${nextTheme} mode`}
      className="group inline-flex h-10 items-center gap-2 rounded-full border border-stone-300/70 bg-white/85 px-3 text-sm font-medium text-stone-700 shadow-[0_14px_34px_rgba(54,34,12,0.12)] transition hover:-translate-y-0.5 hover:bg-white dark:border-white/12 dark:bg-white/6 dark:text-stone-100 dark:hover:bg-white/10"
      disabled={isPending}
      onClick={() => {
        const updatedTheme = nextTheme;
        setTheme(updatedTheme);
        applyTheme(updatedTheme);
        persistTheme(updatedTheme);
        startTransition(() => {
          router.refresh();
        });
      }}
      type="button"
    >
      {theme === "dark" ? (
        <MoonStar className="size-4 text-amber-200" />
      ) : (
        <SunMedium className="size-4 text-amber-700" />
      )}
      <span>{isPending ? "Updating..." : nextTheme === "dark" ? "Dark" : "Light"}</span>
    </button>
  );
}

