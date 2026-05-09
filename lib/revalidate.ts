import "server-only";

import { revalidatePath, revalidateTag } from "next/cache";

import { PostStatus, type PostRecord } from "@/lib/posts";

export const REVALIDATION_TAGS = {
  allPosts: "posts",
  rss: "rss",
  sitemap: "sitemap",
  tagIndex: "tags",
} as const;

type RevalidatePublishedContentOptions = {
  nextPost?: PostRecord | null;
  previousPost?: PostRecord | null;
};

function isPublished(post: PostRecord | null | undefined) {
  return post?.status === PostStatus.PUBLISHED;
}

function collectPublishedSlugs(post: PostRecord | null | undefined) {
  if (!post || post.status !== PostStatus.PUBLISHED) {
    return [];
  }

  return [post.slug];
}

function collectPublishedTagSlugs(post: PostRecord | null | undefined) {
  if (!post || post.status !== PostStatus.PUBLISHED) {
    return [];
  }

  return post.tags.map((tag) => tag.slug);
}

export function revalidatePublishedContent({
  nextPost,
  previousPost,
}: RevalidatePublishedContentOptions) {
  const previouslyPublished = isPublished(previousPost);
  const nextPublished = isPublished(nextPost);

  if (!previouslyPublished && !nextPublished) {
    return;
  }

  const pathsToRevalidate = new Set<string>([
    "/",
    "/rss.xml",
    "/sitemap.xml",
    "/tags",
  ]);
  const tagsToRevalidate = new Set<string>([
    REVALIDATION_TAGS.allPosts,
    REVALIDATION_TAGS.rss,
    REVALIDATION_TAGS.sitemap,
    REVALIDATION_TAGS.tagIndex,
  ]);

  for (const slug of new Set([
    ...collectPublishedSlugs(previousPost),
    ...collectPublishedSlugs(nextPost),
  ])) {
    pathsToRevalidate.add(`/posts/${slug}`);
    tagsToRevalidate.add(`post:${slug}`);
  }

  for (const tagSlug of new Set([
    ...collectPublishedTagSlugs(previousPost),
    ...collectPublishedTagSlugs(nextPost),
  ])) {
    pathsToRevalidate.add(`/tags/${tagSlug}`);
    tagsToRevalidate.add(`tag:${tagSlug}`);
  }

  for (const path of pathsToRevalidate) {
    revalidatePath(path);
  }

  for (const tag of tagsToRevalidate) {
    revalidateTag(tag);
  }
}
