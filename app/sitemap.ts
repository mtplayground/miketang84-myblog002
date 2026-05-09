import type { MetadataRoute } from "next";

import { PostStatus } from "@prisma/client";

import { listAllPosts, listPublicTags } from "@/lib/posts";
import { resolveCanonicalUrl } from "@/lib/site";

export const revalidate = 300;

function buildStaticEntries(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: resolveCanonicalUrl("/").toString(),
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: resolveCanonicalUrl("/about").toString(),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: resolveCanonicalUrl("/tags").toString(),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = buildStaticEntries();

  try {
    const [posts, tags] = await Promise.all([
      listAllPosts({
        sort: "published-desc",
        status: PostStatus.PUBLISHED,
      }),
      listPublicTags(),
    ]);

    return [
      ...staticEntries,
      ...posts.map((post) => ({
        url: resolveCanonicalUrl(`/posts/${post.slug}`).toString(),
        lastModified: post.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...tags.map((tag) => ({
        url: resolveCanonicalUrl(`/tags/${tag.slug}`).toString(),
        lastModified: tag.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ];
  } catch {
    return staticEntries;
  }
}
