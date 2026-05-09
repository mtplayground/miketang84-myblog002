# miketang84-myblog002

Production-ready personal blog built with Next.js 15 App Router, TypeScript, Prisma, PostgreSQL, Auth.js credentials auth, S3-compatible uploads, and a small protected admin for drafting and publishing posts.

The app exposes:

- public pages for the homepage, post detail, tag archives, about page, RSS, sitemap, and robots
- an admin area for login, post editing, publishing, and image uploads
- Docker-based self-hosted deployment with a one-shot Prisma migration job
- Playwright smoke coverage for the core publishing flow

## Stack

- Next.js 15 App Router
- React 19
- TypeScript
- Tailwind CSS v4 and shadcn/ui primitives
- Prisma with PostgreSQL
- Auth.js credentials provider
- S3-compatible object storage for uploads
- Playwright for end-to-end smoke tests

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL 16+ for all persistent state
- S3-compatible object storage for uploaded images

## Local development

1. Install dependencies:

```bash
npm install
```

2. Copy the example environment file:

```bash
cp .env.example .env.local
```

3. Fill in the required values in `.env.local`.

4. Generate a bcrypt password hash for `ADMIN_PASSWORD_HASH`:

```bash
npm run hash-password -- "replace-with-a-strong-password"
```

5. Apply database migrations:

```bash
npm run prisma:migrate:deploy
```

6. Optionally seed sample content:

```bash
npm run prisma:seed
```

7. Start the app:

```bash
npm run dev
```

The development server listens on `0.0.0.0:8080`.

Open:

- public site: `http://localhost:8080`
- admin login: `http://localhost:8080/admin/login`

## Environment variables

Copy `.env.example` and provide the following values.

### Required

- `DATABASE_URL`
  PostgreSQL connection string used by Prisma and every other persistent feature.

- `NEXTAUTH_SECRET`
  Long random secret for Auth.js session and JWT signing.

- `ADMIN_USERNAME`
  Username for the built-in credentials-based admin account.

- `ADMIN_PASSWORD_HASH`
  Bcrypt hash generated from the helper script.

- `S3_BUCKET`
  Bucket name used for uploaded images.

- `S3_REGION`
  Region value for the S3-compatible provider.

- `S3_ACCESS_KEY`
  Access key for the object storage account.

- `S3_SECRET_KEY`
  Secret key for the object storage account.

- `S3_ENDPOINT`
  Endpoint URL for the S3-compatible API.

- `S3_PUBLIC_URL`
  Public base URL used to resolve uploaded asset URLs.

- `S3_FORCE_PATH_STYLE`
  `true` for providers that require path-style addressing, otherwise `false`.

- `SITE_URL`
  Canonical public base URL used for metadata, callbacks, RSS, sitemap, and robots.

### Optional

- `ABOUT_TITLE`
  Browser/page title for `/about`.

- `ABOUT_HEADING`
  Top-level heading for `/about`.

- `ABOUT_BIO_MARKDOWN`
  Markdown override for `/about`. If unset, the app renders `content/about.md`.

## Password hash generation

Use the helper whenever you need to rotate admin credentials:

```bash
npm run hash-password -- "your-new-password"
```

You can also pipe from stdin:

```bash
printf '%s' 'your-new-password' | npm run hash-password
```

The command prints a bcrypt hash. Put that value into `ADMIN_PASSWORD_HASH`.

## Database workflow

Apply committed migrations:

```bash
npm run prisma:migrate:deploy
```

Seed sample posts and tags into a fresh environment:

```bash
npm run prisma:seed
```

Generate the Prisma client if needed after dependency changes:

```bash
npm run prisma:generate
```

## Docker Compose deployment

The repository includes:

- `Dockerfile`
  Multi-stage build for the Next.js standalone output

- `docker-compose.yml`
  `postgres`, `migrate`, and `app` services

### What the compose stack does

- `postgres`
  Runs PostgreSQL 16 with a named volume at `postgres_data`

- `migrate`
  Runs `prisma migrate deploy` once after Postgres becomes healthy

- `app`
  Starts the standalone Next.js server on port `8080`

### Deploy steps

1. Create a deployment env file, for example `.env.production`, and populate the app secrets and S3 settings.

2. Start the stack:

```bash
docker compose --env-file .env.production up --build -d
```

3. Check service status:

```bash
docker compose ps
```

4. View logs if needed:

```bash
docker compose logs -f app
docker compose logs -f migrate
docker compose logs -f postgres
```

The application is served on `http://localhost:8080` unless you override `APP_PORT`.

### Compose-specific variables

`docker-compose.yml` also supports:

- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_PORT`
- `APP_PORT`

If these are omitted, the compose defaults are used.

## Backups

This app has two persistent data stores:

- PostgreSQL for posts, tags, auth configuration, and publishing metadata
- S3-compatible object storage for uploaded images

Both need a backup strategy.

### Back up the database

From the compose stack:

```bash
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-postgres}" \
  -d "${POSTGRES_DB:-myblog002}" \
  --format=custom \
  --file=/tmp/myblog002.dump
```

Copy the dump out of the container:

```bash
docker compose cp postgres:/tmp/myblog002.dump ./myblog002.dump
```

You can also back up directly from any machine that can reach the database:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=./myblog002.dump
```

### Restore the database

Against a reachable PostgreSQL instance:

```bash
pg_restore --clean --if-exists --no-owner --no-privileges \
  -d "$DATABASE_URL" \
  ./myblog002.dump
```

If you restore into a new environment, run migrations afterward to confirm schema state:

```bash
npm run prisma:migrate:deploy
```

### Back up uploads

Uploads are not stored inside the app container. They live in your configured S3-compatible bucket.

Back up that bucket using your provider tooling, for example:

- bucket replication
- object versioning
- periodic bucket export or sync job
- provider-native snapshots or lifecycle rules

At minimum, keep:

- the full bucket contents
- bucket policy and credentials managed outside the repository
- the `S3_*` environment values used by the deployment

## Verification and tests

Lint the codebase:

```bash
npm run lint
```

Build the production bundle:

```bash
npm run build
```

Run the Playwright smoke test:

```bash
npm run test:e2e
```

The smoke test covers:

- admin login
- draft creation
- publish flow
- homepage visibility
- post detail rendering
- sign out

For a clean local run, make sure:

- migrations have been applied
- the app can connect to PostgreSQL
- `ADMIN_USERNAME` matches the test login
- `ADMIN_PASSWORD_HASH` matches `PLAYWRIGHT_ADMIN_PASSWORD` if you override the default test password

Optional Playwright overrides:

- `PLAYWRIGHT_ADMIN_USERNAME`
- `PLAYWRIGHT_ADMIN_PASSWORD`

## Common commands

```bash
npm install
npm run dev
npm run lint
npm run build
npm run prisma:migrate:deploy
npm run prisma:seed
npm run hash-password -- "your-password"
npm run test:e2e
```
