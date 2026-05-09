/* eslint-disable @next/next/no-img-element */

import Link from "next/link";

import { coerceDate } from "@/lib/date";
import { type PostRecord } from "@/lib/posts";

type PostCardProps = {
  post: PostRecord;
};

function formatPublishedDate(value: Date | null) {
  const normalizedDate = coerceDate(value);

  if (!normalizedDate) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(normalizedDate);
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="overflow-hidden rounded-[1.9rem] border border-stone-300/70 bg-white/82 shadow-[0_22px_72px_rgba(71,45,17,0.12)] backdrop-blur transition hover:-translate-y-1 hover:shadow-[0_30px_88px_rgba(71,45,17,0.16)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.26)]">
      <Link className="block" href={`/posts/${post.slug}`}>
        {post.coverImageUrl ? (
          <div className="aspect-[16/9] overflow-hidden border-b border-stone-300/70 bg-stone-100 dark:border-white/10 dark:bg-stone-900">
            <img
              alt={post.title}
              className="h-full w-full object-cover transition duration-300 hover:scale-[1.02]"
              src={post.coverImageUrl}
            />
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-end border-b border-stone-300/70 bg-[linear-gradient(135deg,rgba(189,130,64,0.22),rgba(255,255,255,0.84))] px-6 py-5 dark:border-white/10 dark:bg-[linear-gradient(135deg,rgba(217,174,117,0.22),rgba(255,255,255,0.03))]">
            <span className="text-sm font-semibold tracking-[0.22em] text-amber-800 uppercase dark:text-amber-200">
              myblog002
            </span>
          </div>
        )}
      </Link>

      <div className="space-y-4 px-6 py-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase dark:text-stone-400">
          <span>{formatPublishedDate(post.publishedAt)}</span>
          {post.tags.length > 0 ? <span>•</span> : null}
          {post.tags.slice(0, 3).map((tag) => (
            <Link
              className="rounded-full border border-stone-300/70 bg-stone-50/90 px-2.5 py-1 text-[0.68rem] tracking-[0.14em] transition hover:border-amber-500/40 hover:text-amber-800 dark:border-white/10 dark:bg-white/6 dark:hover:text-amber-200"
              href={`/tags/${tag.slug}`}
              key={tag.id}
            >
              {tag.name}
            </Link>
          ))}
        </div>

        <div className="space-y-3">
          <Link href={`/posts/${post.slug}`}>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-950 transition hover:text-amber-800 dark:text-stone-50 dark:hover:text-amber-200">
              {post.title}
            </h2>
          </Link>
          <p className="line-clamp-3 text-sm leading-7 text-stone-700 dark:text-stone-300">
            {post.excerpt || "No excerpt has been added for this post yet."}
          </p>
        </div>

        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-amber-800 transition hover:gap-3 dark:text-amber-200"
          href={`/posts/${post.slug}`}
        >
          Read article
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
