import { defineConfig } from "@playwright/test";

const baseURL = "http://127.0.0.1:8080";
const adminUsername = "admin";
const adminPassword = "playwright-admin-password";
const adminPasswordHash =
  "$2b$12$/UPCOHS11DpGzIoMoGC/DuDG39SgE.EidiR4V7YZiy/cE9DyXOrNC";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  webServer: {
    command: "npx prisma migrate deploy && npm run dev",
    url: baseURL,
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 180_000,
    env: {
      ...process.env,
      HOST: "0.0.0.0",
      PORT: "8080",
      NEXTAUTH_SECRET:
        process.env.NEXTAUTH_SECRET ??
        "development-only-nextauth-secret-value-1234",
      ADMIN_USERNAME: process.env.ADMIN_USERNAME ?? adminUsername,
      ADMIN_PASSWORD_HASH:
        process.env.ADMIN_PASSWORD_HASH ?? adminPasswordHash,
      PLAYWRIGHT_ADMIN_USERNAME:
        process.env.PLAYWRIGHT_ADMIN_USERNAME ?? adminUsername,
      PLAYWRIGHT_ADMIN_PASSWORD:
        process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? adminPassword,
      S3_BUCKET: process.env.S3_BUCKET ?? "myblog-assets",
      S3_REGION: process.env.S3_REGION ?? "auto",
      S3_ACCESS_KEY: process.env.S3_ACCESS_KEY ?? "test-access-key",
      S3_SECRET_KEY: process.env.S3_SECRET_KEY ?? "test-secret-key",
      S3_ENDPOINT: process.env.S3_ENDPOINT ?? "https://s3.example.com",
      S3_PUBLIC_URL: process.env.S3_PUBLIC_URL ?? "https://cdn.example.com",
      SITE_URL: process.env.SITE_URL ?? baseURL,
    },
  },
});
