import Link from "next/link";

import { unstable_cache } from "next/cache";

import { buttonVariants } from "@/components/ui/button";
import { listPublicTags } from "@/lib/posts";
import { REVALIDATION_TAGS } from "@/lib/revalidate";
import { cn } from "@/lib/utils";

const getPublicTags = unstable_cache(async () => listPublicTags(), ["public-tags"], {
  revalidate: 300,
  tags: [REVALIDATION_TAGS.allPosts, REVALIDATION_TAGS.tagIndex],
});

export const revalidate = 300;

export default async function TagsIndexPage() {
  const tags = await getPublicTags();

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.1),transparent_52%)]" />

      <section className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
              Topics
            </p>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-stone-950 sm:text-6xl dark:text-stone-50">
                  Browse the archive by tag.
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-stone-700 sm:text-xl dark:text-stone-300">
                  Every public tag carries a live published-post count so readers
                  can jump into a topic cluster directly.
                </p>
              </div>

              <div className="rounded-full border border-stone-300/70 bg-white/76 px-4 py-3 text-sm text-stone-700 shadow-[0_16px_44px_rgba(71,45,17,0.1)] dark:border-white/10 dark:bg-white/6 dark:text-stone-300">
                {tags.length} active tag{tags.length === 1 ? "" : "s"}
              </div>
            </div>
          </div>

          {tags.length === 0 ? (
            <div className="rounded-[2rem] border border-dashed border-stone-300/80 bg-white/74 px-8 py-16 text-center shadow-[0_24px_72px_rgba(71,45,17,0.12)] dark:border-white/12 dark:bg-white/5">
              <h2 className="text-2xl font-semibold text-stone-950 dark:text-stone-50">
                No public tags yet
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-stone-700 dark:text-stone-300">
                Tags will appear here once published posts are assigned to them.
              </p>
              <div className="mt-6">
                <Link
                  className={cn(
                    buttonVariants({
                      className: "rounded-full px-5",
                      size: "lg",
                    }),
                  )}
                  href="/admin/posts"
                >
                  Open admin
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {tags.map((tag) => (
                <Link
                  className="group rounded-[1.7rem] border border-stone-300/70 bg-white/80 px-6 py-6 shadow-[0_20px_60px_rgba(71,45,17,0.1)] transition hover:-translate-y-1 hover:shadow-[0_26px_76px_rgba(71,45,17,0.14)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.24)]"
                  href={`/tags/${tag.slug}`}
                  key={tag.id}
                >
                  <p className="text-xs font-semibold tracking-[0.2em] text-stone-500 uppercase dark:text-stone-400">
                    Topic
                  </p>
                  <div className="mt-3 flex items-end justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold text-stone-950 transition group-hover:text-amber-800 dark:text-stone-50 dark:group-hover:text-amber-200">
                        {tag.name}
                      </h2>
                      <p className="mt-2 text-sm text-stone-600 dark:text-stone-300">
                        {tag.postCount} published post
                        {tag.postCount === 1 ? "" : "s"}
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-amber-800 transition group-hover:translate-x-1 dark:text-amber-200">
                      →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

