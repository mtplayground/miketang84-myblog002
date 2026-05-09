import { z } from "zod";

const stringBoolean = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalizedValue = value.trim().toLowerCase();

  if (normalizedValue === "") {
    return undefined;
  }

  if (["1", "true", "yes", "on"].includes(normalizedValue)) {
    return true;
  }

  if (["0", "false", "no", "off"].includes(normalizedValue)) {
    return false;
  }

  return value;
}, z.boolean());

const databaseUrl = z
  .string()
  .trim()
  .min(1, "DATABASE_URL is required.")
  .refine(
    (value) =>
      value.startsWith("postgres://") || value.startsWith("postgresql://"),
    {
      message: "DATABASE_URL must begin with postgres:// or postgresql://.",
    },
  );

const s3EnvFields = {
  S3_BUCKET: z.string().trim().min(1, "S3_BUCKET is required."),
  S3_REGION: z.string().trim().min(1).default("auto"),
  S3_ACCESS_KEY: z.string().trim().min(1, "S3_ACCESS_KEY is required."),
  S3_SECRET_KEY: z.string().trim().min(1, "S3_SECRET_KEY is required."),
  S3_ENDPOINT: z.string().trim().url("S3_ENDPOINT must be a valid URL."),
  S3_PUBLIC_URL: z.string().trim().url("S3_PUBLIC_URL must be a valid URL."),
  S3_FORCE_PATH_STYLE: stringBoolean.optional().default(false),
};

export const serverEnvSchema = z.object({
  DATABASE_URL: databaseUrl,
  NEXTAUTH_SECRET: z
    .string()
    .trim()
    .min(32, "NEXTAUTH_SECRET must be at least 32 characters long."),
  ADMIN_USERNAME: z.string().trim().min(1, "ADMIN_USERNAME is required."),
  ADMIN_PASSWORD_HASH: z
    .string()
    .trim()
    .min(20, "ADMIN_PASSWORD_HASH must be a non-empty password hash."),
  ...s3EnvFields,
  SITE_URL: z.string().trim().url("SITE_URL must be a valid absolute URL."),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
export const authEnvSchema = serverEnvSchema.pick({
  NEXTAUTH_SECRET: true,
  ADMIN_USERNAME: true,
  ADMIN_PASSWORD_HASH: true,
});

export type AuthEnv = z.infer<typeof authEnvSchema>;
export const s3EnvSchema = z.object(s3EnvFields);

export type S3Env = z.infer<typeof s3EnvSchema>;

type EnvSource = Record<string, string | undefined>;

let cachedProcessEnv: ServerEnv | undefined;
let cachedAuthEnv: AuthEnv | undefined;
let cachedS3Env: S3Env | undefined;

function formatEnvErrors(error: z.ZodError) {
  return error.issues
    .map((issue) => {
      const path = issue.path.join(".") || "environment";
      return `- ${path}: ${issue.message}`;
    })
    .join("\n");
}

function normalizeServerEnvSource(source: EnvSource) {
  return {
    ...source,
    S3_ACCESS_KEY: source.S3_ACCESS_KEY ?? source.S3_ACCESS_KEY_ID,
    S3_SECRET_KEY: source.S3_SECRET_KEY ?? source.S3_SECRET_ACCESS_KEY,
    S3_PUBLIC_URL: source.S3_PUBLIC_URL ?? source.S3_PUBLIC_BASE_URL,
    S3_REGION: source.S3_REGION ?? "auto",
  };
}

export function loadServerEnv(source: EnvSource = process.env): ServerEnv {
  if (source === process.env && cachedProcessEnv) {
    return cachedProcessEnv;
  }

  const parsedEnv = serverEnvSchema.safeParse(normalizeServerEnvSource(source));

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid environment variables:\n${formatEnvErrors(parsedEnv.error)}`,
    );
  }

  if (source === process.env) {
    cachedProcessEnv = parsedEnv.data;
  }

  return parsedEnv.data;
}

export function loadAuthEnv(source: EnvSource = process.env): AuthEnv {
  if (source === process.env && cachedAuthEnv) {
    return cachedAuthEnv;
  }

  const parsedEnv = authEnvSchema.safeParse(source);

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid authentication environment variables:\n${formatEnvErrors(parsedEnv.error)}`,
    );
  }

  if (source === process.env) {
    cachedAuthEnv = parsedEnv.data;
  }

  return parsedEnv.data;
}

export function loadS3Env(source: EnvSource = process.env): S3Env {
  if (source === process.env && cachedS3Env) {
    return cachedS3Env;
  }

  const parsedEnv = s3EnvSchema.safeParse(normalizeServerEnvSource(source));

  if (!parsedEnv.success) {
    throw new Error(
      `Invalid S3 environment variables:\n${formatEnvErrors(parsedEnv.error)}`,
    );
  }

  if (source === process.env) {
    cachedS3Env = parsedEnv.data;
  }

  return parsedEnv.data;
}
