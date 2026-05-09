import Link from "next/link";
import { notFound } from "next/navigation";

import { unstable_cache } from "next/cache";

import { PostCard } from "@/components/site/post-card";
import { buttonVariants } from "@/components/ui/button";
import {
  type ListPostsResult,
  PostStatus,
  getTagBySlug,
  listPosts,
} from "@/lib/posts";
import { REVALIDATION_TAGS } from "@/lib/revalidate";
import { cn } from "@/lib/utils";

type TagDetailPageProps = {
  params: Promise<{
    tag: string;
  }>;
  searchParams?: Promise<{
    page?: string | string[];
  }>;
};

const POSTS_PER_PAGE = 6;

const getPublishedPostsForTag = unstable_cache(
  async (tagSlug: string, page: number): Promise<ListPostsResult> =>
    listPosts({
      page,
      pageSize: POSTS_PER_PAGE,
      sort: "published-desc",
      status: PostStatus.PUBLISHED,
      tagSlug,
    }),
  ["tag-posts"],
  {
    revalidate: 300,
    tags: [REVALIDATION_TAGS.allPosts, REVALIDATION_TAGS.tagIndex],
  },
);

const getTag = unstable_cache(async (tagSlug: string) => getTagBySlug(tagSlug), ["tag-detail"], {
  revalidate: 300,
  tags: [REVALIDATION_TAGS.tagIndex],
});

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizePage(value: string | undefined) {
  if (!value) {
    return 1;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return 1;
  }

  return parsedValue;
}

function buildPageHref(tag: string, page: number) {
  return page <= 1 ? `/tags/${tag}` : `/tags/${tag}?page=${page}`;
}

export const revalidate = 300;

export default async function TagDetailPage({
  params,
  searchParams,
}: TagDetailPageProps) {
  const { tag } = await params;
  const resolvedSearchParams = await searchParams;
  const currentPage = normalizePage(readFirstParam(resolvedSearchParams?.page));
  const [tagRecord, postPage] = await Promise.all([
    getTag(tag),
    getPublishedPostsForTag(tag, currentPage),
  ]);

  if (!tagRecord) {
    notFound();
  }

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.1),transparent_52%)]" />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase dark:text-stone-400">
              <Link
                className="transition hover:text-amber-800 dark:hover:text-amber-200"
                href="/tags"
              >
                Tags
              </Link>
              <span>•</span>
              <span>{tagRecord.name}</span>
            </div>

            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-stone-950 sm:text-6xl dark:text-stone-50">
                  {tagRecord.name}
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl dark:text-stone-300">
                  Published posts tagged with <span className="font-semibold">{tagRecord.name}</span>.
                </p>
              </div>

              <div className="rounded-full border border-stone-300/70 bg-white/76 px-4 py-3 text-sm text-stone-700 shadow-[0_16px_44px_rgba(71,45,17,0.1)] dark:border-white/10 dark:bg-white/6 dark:text-stone-300">
                {postPage.totalCount} published post
                {postPage.totalCount === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {postPage.posts.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300/80 bg-white/74 px-8 py-16 text-center shadow-[0_24px_72px_rgba(71,45,17,0.12)] dark:border-white/12 dark:bg-white/5">
              <h2 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
                No published posts for this tag yet
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700 dark:text-stone-300">
                The tag exists, but nothing using it has been published yet.
              </p>
              <div className="mt-6">
                <Link
                  className={cn(
                    buttonVariants({
                      className: "rounded-full px-5",
                      size: "lg",
                      variant: "outline",
                    }),
                  )}
                  href="/tags"
                >
                  Browse all tags
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
                {postPage.posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              <nav className="flex flex-col gap-4 border-t border-stone-300/65 pt-6 sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
                <p className="text-sm text-stone-600 dark:text-stone-300">
                  Page {postPage.page} of {postPage.pageCount}
                </p>

                <div className="flex gap-3">
                  <Link
                    aria-disabled={postPage.page <= 1}
                    className={cn(
                      buttonVariants({
                        className: "rounded-full px-5",
                        variant: "outline",
                      }),
                      postPage.page <= 1
                        ? "pointer-events-none opacity-50"
                        : null,
                    )}
                    href={buildPageHref(tagRecord.slug, postPage.page - 1)}
                  >
                    Previous
                  </Link>
                  <Link
                    aria-disabled={postPage.page >= postPage.pageCount}
                    className={cn(
                      buttonVariants({
                        className: "rounded-full px-5",
                      }),
                      postPage.page >= postPage.pageCount
                        ? "pointer-events-none opacity-50"
                        : null,
                    )}
                    href={buildPageHref(tagRecord.slug, postPage.page + 1)}
                  >
                    Next
                  </Link>
                </div>
              </nav>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
