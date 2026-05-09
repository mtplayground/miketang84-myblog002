import { expect, test } from "@playwright/test";

const adminUsername = process.env.PLAYWRIGHT_ADMIN_USERNAME ?? "admin";
const adminPassword =
  process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? "playwright-admin-password";

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

test("admin login, draft creation, publish flow, public visibility, and sign out", async ({
  page,
}) => {
  const timestamp = Date.now();
  const title = `Playwright Smoke Post ${timestamp}`;
  const excerpt = `Playwright excerpt ${timestamp}`;
  const body = `# ${title}

This post was created by the end-to-end smoke test.

- create draft
- publish post
- verify public visibility
`;

  await page.goto("/admin/login");

  await page.getByLabel("Username").fill(adminUsername);
  await page.getByLabel("Password").fill(adminPassword);
  await page.getByRole("button", { name: "Sign in" }).click();

  await expect(page).toHaveURL(/\/admin$/);

  await page.getByRole("link", { name: "Posts" }).click();
  await expect(page).toHaveURL(/\/admin\/posts$/);

  await page.getByRole("link", { name: "Create post" }).click();
  await expect(page).toHaveURL(/\/admin\/posts\/new$/);

  await page.getByLabel("Title", { exact: true }).fill(title);
  await page.getByLabel("Excerpt", { exact: true }).fill(excerpt);
  await page.getByLabel("Tags", { exact: true }).fill("playwright, smoke-test");
  await page.locator(".ProseMirror").click();
  await page.keyboard.insertText(body);
  await expect(page.locator('textarea[name="content"]')).toHaveValue(
    new RegExp(escapeRegExp(title)),
  );
  await expect(page.locator('textarea[name="content"]')).toHaveValue(
    /verify public visibility/,
  );

  await page.getByRole("button", { name: "Create draft" }).click();
  await expect(page).not.toHaveURL(/\/admin\/posts\/new$/);
  await expect(page).toHaveURL(/\/admin\/posts\/[^/]+$/);
  await expect(
    page.getByText("Manage metadata, cover art, tags, publication settings"),
  ).toBeVisible();
  await expect(page.locator('textarea[name="content"]')).toHaveValue(
    new RegExp(escapeRegExp(title)),
  );

  await page.getByRole("button", { name: "Publish", exact: true }).click();
  await expect(page.getByLabel("Publish state")).toHaveValue("PUBLISHED");

  await page.goto("/");
  await expect(page.getByRole("heading", { name: title })).toBeVisible();

  const articleCard = page
    .locator("article")
    .filter({ has: page.getByRole("heading", { name: title }) });
  const detailHref = await articleCard
    .getByRole("link", { name: "Read article" })
    .getAttribute("href");
  if (!detailHref) {
    throw new Error("Expected homepage card to expose a post detail link.");
  }
  await page.goto(detailHref);
  await expect(page).toHaveURL(/\/posts\/.+/);
  await expect(page.locator("article > div h1").first()).toHaveText(title);
  await expect(page.getByText(excerpt)).toBeVisible();

  await page.goto("/admin");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/admin\/login$/);
  await expect(
    page.getByRole("heading", {
      name: "Sign in to manage posts, tags, and publishing workflows.",
    }),
  ).toBeVisible();
});
