import "server-only";

export const SITE_NAME = "myblog002";
export const SITE_DESCRIPTION = "A self-hosted blog built with Next.js 15.";
export const DEFAULT_AUTHOR_NAME = "Mike Tang";

const defaultSiteUrl = new URL("http://localhost:8080");

function resolveAbsoluteUrl(value: string) {
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function resolveSiteUrl() {
  const envSiteUrl = process.env.SITE_URL?.trim();

  if (!envSiteUrl) {
    return defaultSiteUrl;
  }

  return resolveAbsoluteUrl(envSiteUrl) ?? defaultSiteUrl;
}

export function resolveCanonicalUrl(pathname: string) {
  return new URL(pathname, resolveSiteUrl());
}

export function resolveOpenGraphImageUrl(value: string | null | undefined) {
  if (!value) {
    return undefined;
  }

  return resolveAbsoluteUrl(value) ?? resolveCanonicalUrl(value);
}
