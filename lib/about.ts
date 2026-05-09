import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

const ABOUT_TITLE = "About";
const ABOUT_HEADING = "A working notebook behind the published posts.";

type AboutContent = {
  body: string;
  heading: string;
  title: string;
};

const aboutMarkdownPath = path.join(process.cwd(), "content", "about.md");

function normalizeOptionalEnvString(value: string | undefined) {
  const normalizedValue = value?.trim();
  return normalizedValue ? normalizedValue : null;
}

export async function loadAboutContent(): Promise<AboutContent> {
  const envBody = normalizeOptionalEnvString(process.env.ABOUT_BIO_MARKDOWN);

  if (envBody) {
    return {
      body: envBody,
      heading:
        normalizeOptionalEnvString(process.env.ABOUT_HEADING) ?? ABOUT_HEADING,
      title: normalizeOptionalEnvString(process.env.ABOUT_TITLE) ?? ABOUT_TITLE,
    };
  }

  const body = await readFile(aboutMarkdownPath, "utf8");

  return {
    body,
    heading: ABOUT_HEADING,
    title: ABOUT_TITLE,
  };
}
