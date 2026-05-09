import { PostStatus, PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleTags = [
  {
    name: "Engineering",
    slug: "engineering",
  },
  {
    name: "Workflow",
    slug: "workflow",
  },
  {
    name: "Publishing",
    slug: "publishing",
  },
] as const;

const samplePosts = [
  {
    slug: "shipping-without-drama",
    title: "Shipping Without Drama",
    excerpt:
      "A sample published post about reducing complexity before a project starts scaling.",
    content: `# Shipping Without Drama

The fastest way to ship reliably is to remove the parts of the system that nobody is actually prepared to support.

## What this sample post is doing

- proving the blog can render seeded content on a fresh deploy
- exercising markdown headings and lists
- giving the public homepage and feed something meaningful to show

## Operational rule

Prefer the boring path when it gives future-you fewer moving parts to explain.
`,
    publishedAt: new Date("2026-05-01T09:00:00.000Z"),
    tagSlugs: ["engineering", "workflow"],
  },
  {
    slug: "editorial-systems-for-small-sites",
    title: "Editorial Systems for Small Sites",
    excerpt:
      "A sample post on turning a lightweight publishing stack into a repeatable workflow.",
    content: `# Editorial Systems for Small Sites

Even a personal blog benefits from a few explicit rules around drafting, editing, and publishing.

## Keep the loop short

1. write in markdown
2. review the draft in the admin
3. publish only when the page metadata and feed output look correct

That is enough process for a site that should stay easy to operate.
`,
    publishedAt: new Date("2026-05-03T14:30:00.000Z"),
    tagSlugs: ["workflow", "publishing"],
  },
] as const;

async function seed() {
  const tags = await Promise.all(
    sampleTags.map((tag) =>
      prisma.tag.upsert({
        where: {
          slug: tag.slug,
        },
        update: {
          name: tag.name,
        },
        create: tag,
      }),
    ),
  );

  const tagsBySlug = new Map(tags.map((tag) => [tag.slug, tag]));

  for (const post of samplePosts) {
    const connectedTags = post.tagSlugs.map((tagSlug) => {
      const tag = tagsBySlug.get(tagSlug);

      if (!tag) {
        throw new Error(`Missing seeded tag for slug "${tagSlug}".`);
      }

      return tag;
    });

    await prisma.post.upsert({
      where: {
        slug: post.slug,
      },
      update: {
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: PostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
        tags: {
          deleteMany: {},
          create: connectedTags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
      create: {
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        content: post.content,
        status: PostStatus.PUBLISHED,
        publishedAt: post.publishedAt,
        tags: {
          create: connectedTags.map((tag) => ({
            tagId: tag.id,
          })),
        },
      },
    });
  }
}

seed()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error("Seeding failed.", error);
    await prisma.$disconnect();
    process.exitCode = 1;
  });
