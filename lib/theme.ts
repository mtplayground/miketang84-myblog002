export const THEME_COOKIE_NAME = "theme";

export type Theme = "dark" | "light";

export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}

export function resolveTheme(value: string | null | undefined): Theme {
  return isTheme(value) ? value : DEFAULT_THEME;
}

