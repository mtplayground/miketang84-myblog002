/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import { notFound } from "next/navigation";

import { unstable_cache } from "next/cache";

import { getPostBySlug } from "@/lib/posts";
import { REVALIDATION_TAGS } from "@/lib/revalidate";
import { renderMarkdownToHtml } from "@/lib/markdown";

type PostDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const getPublishedPost = unstable_cache(
  async (slug: string) =>
    getPostBySlug(slug, {
      allowDraft: false,
    }),
  ["published-post"],
  {
    revalidate: 300,
    tags: [REVALIDATION_TAGS.allPosts],
  },
);

function formatPublishedDate(value: Date | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
  }).format(value);
}

export const revalidate = 300;

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post || post.status !== "PUBLISHED") {
    notFound();
  }

  const renderedHtml = await renderMarkdownToHtml(post.content);
  const publishedDate = formatPublishedDate(post.publishedAt);

  return (
    <article className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.12),transparent_52%)]" />

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase dark:text-stone-400">
            <Link
              className="transition hover:text-amber-800 dark:hover:text-amber-200"
              href="/"
            >
              Home
            </Link>
            <span>•</span>
            <span>{publishedDate ?? "Published"}</span>
          </div>

          <div className="space-y-4">
            <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-stone-950 sm:text-6xl dark:text-stone-50">
              {post.title}
            </h1>
            {post.excerpt ? (
              <p className="max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl dark:text-stone-300">
                {post.excerpt}
              </p>
            ) : null}
          </div>

          {post.tags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  className="rounded-full border border-stone-300/70 bg-white/80 px-3 py-1.5 text-xs font-semibold tracking-[0.14em] text-stone-700 uppercase shadow-[0_12px_28px_rgba(71,45,17,0.08)] transition hover:border-amber-500/40 hover:text-amber-800 dark:border-white/10 dark:bg-white/6 dark:text-stone-300 dark:hover:text-amber-200"
                  href={`/tags/${tag.slug}`}
                  key={tag.id}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>

        {post.coverImageUrl ? (
          <div className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/76 shadow-[0_28px_88px_rgba(71,45,17,0.14)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.28)]">
            <img
              alt={post.title}
              className="h-auto w-full object-cover"
              src={post.coverImageUrl}
            />
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[2rem] border border-stone-300/70 bg-white/78 shadow-[0_24px_72px_rgba(71,45,17,0.12)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.24)]">
          <div className="border-b border-stone-300/70 px-6 py-4 text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase dark:border-white/10 dark:text-stone-400">
            Article
          </div>
          <div className="px-6 py-8 sm:px-10">
            <div
              className="article-markdown max-w-none text-[1.02rem] leading-8 text-stone-800 dark:text-stone-200 [&_a]:font-medium [&_a]:text-amber-800 [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-amber-700 dark:[&_a]:text-amber-200 dark:hover:[&_a]:text-amber-100 [&_blockquote]:my-6 [&_blockquote]:border-l-4 [&_blockquote]:border-amber-700/30 [&_blockquote]:pl-5 [&_blockquote]:italic [&_code]:rounded [&_code]:bg-stone-900/95 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-[0.92em] [&_code]:text-stone-100 [&_h1]:mb-4 [&_h1]:text-4xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h2]:mb-4 [&_h2]:mt-10 [&_h2]:text-3xl [&_h2]:font-semibold [&_h2]:tracking-tight [&_h3]:mb-3 [&_h3]:mt-8 [&_h3]:text-2xl [&_h3]:font-semibold [&_img]:rounded-2xl [&_img]:border [&_img]:border-stone-300/70 [&_img]:shadow-[0_20px_60px_rgba(71,45,17,0.12)] dark:[&_img]:border-white/10 [&_li]:my-2 [&_ol]:my-6 [&_ol]:pl-6 [&_ol]:list-decimal [&_p]:my-5 [&_pre]:my-6 [&_pre]:overflow-x-auto [&_pre]:rounded-2xl [&_pre]:border [&_pre]:border-stone-300/60 [&_pre]:bg-stone-950 [&_pre]:px-5 [&_pre]:py-4 [&_pre]:text-sm [&_pre]:leading-7 [&_pre]:text-stone-100 dark:[&_pre]:border-white/10 [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_ul]:my-6 [&_ul]:pl-6 [&_ul]:list-disc"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        </div>
      </div>
    </article>
  );
}
