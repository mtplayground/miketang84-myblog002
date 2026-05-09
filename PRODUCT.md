# Product Snapshot

`miketang84-myblog002` is a self-hosted personal publishing system built on Next.js 15. It combines a public blog with a protected admin for drafting, editing, publishing, and managing image uploads.

## What It Does

- Serves a public homepage with paginated published posts
- Renders post detail pages from markdown with syntax highlighting
- Organizes content by tags with tag index and per-tag archives
- Exposes static `About`, `RSS`, `sitemap.xml`, and `robots.txt` routes
- Provides an admin login and protected post-management workflow
- Uploads editor images to S3-compatible object storage

## Core Features

- Credentials-based admin auth via Auth.js using env-managed admin credentials
- Prisma data layer on PostgreSQL for posts, tags, and post-tag relations
- TipTap-based markdown editor with toolbar and upload integration
- Publish, unpublish, delete, and draft-save actions from the admin
- On-demand revalidation for homepage, post pages, tag pages, sitemap, and RSS
- Seed script for sample posts and Playwright smoke coverage for the publish flow

## Architecture

- Next.js App Router with route groups for public and admin surfaces
- PostgreSQL is the only persistent application database
- S3-compatible storage is the only upload store; uploads are not kept locally
- Prisma is the canonical server-side data access layer
- Public pages are server-rendered with ISR/revalidation where appropriate
- Docker Compose deploys three services: `postgres`, `migrate`, and `app`

## Conventions

- App runtime binds to `0.0.0.0:8080`
- Environment contract is defined in `.env.example`
- Admin access is env-bootstrapped, not user-self-service
- Content lives in markdown; `/about` can use env overrides or `content/about.md`
- Operational docs live in `README.md`
