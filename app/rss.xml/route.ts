import { PostStatus } from "@prisma/client";

import { listAllPosts } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_NAME, resolveCanonicalUrl } from "@/lib/site";

export const revalidate = 300;

const RSS_POST_LIMIT = 20;

function escapeXml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function buildRssXml(posts: Awaited<ReturnType<typeof listAllPosts>>) {
  const siteUrl = resolveCanonicalUrl("/");
  const feedUrl = resolveCanonicalUrl("/rss.xml");
  const items = posts
    .slice(0, RSS_POST_LIMIT)
    .map((post) => {
      const postUrl = resolveCanonicalUrl(`/posts/${post.slug}`);
      const excerpt = post.excerpt ? `<description>${escapeXml(post.excerpt)}</description>` : "";
      const pubDate = post.publishedAt
        ? `<pubDate>${post.publishedAt.toUTCString()}</pubDate>`
        : "";

      return [
        "<item>",
        `<title>${escapeXml(post.title)}</title>`,
        `<link>${escapeXml(postUrl.toString())}</link>`,
        `<guid>${escapeXml(postUrl.toString())}</guid>`,
        pubDate,
        excerpt,
        "</item>",
      ]
        .filter(Boolean)
        .join("");
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${escapeXml(siteUrl.toString())}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <atom:link href="${escapeXml(feedUrl.toString())}" rel="self" type="application/rss+xml" />
    ${items}
  </channel>
</rss>`;
}

export async function GET() {
  try {
    const posts = await listAllPosts({
      sort: "published-desc",
      status: PostStatus.PUBLISHED,
    });

    return new Response(buildRssXml(posts), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  } catch {
    return new Response(buildRssXml([]), {
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
      },
    });
  }
}
