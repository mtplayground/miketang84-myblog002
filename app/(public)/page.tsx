import Link from "next/link";

import { ArrowRight, MoonStar, Newspaper, PencilLine } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const highlights = [
  {
    description:
      "A protected editorial backend already supports auth, uploads, post workflows, and cache invalidation.",
    icon: PencilLine,
    title: "Admin-ready foundation",
  },
  {
    description:
      "The public shell now has its own header, footer, and a cookie-backed theme preference for returning readers.",
    icon: MoonStar,
    title: "Reader-facing chrome",
  },
  {
    description:
      "Post listings, detail routes, tags, feeds, and SEO surfaces will plug into this layout in the next steps.",
    icon: Newspaper,
    title: "Publishing runway",
  },
] as const;

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[32rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_60%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.12),transparent_52%)]" />

      <section className="mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-8 xl:grid-cols-[minmax(0,1.15fr)_480px]">
          <div className="flex flex-col justify-center gap-8">
            <div className="space-y-5">
              <p className="text-sm font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
                Public shell
              </p>
              <div className="space-y-4">
                <h1 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] text-balance text-stone-950 sm:text-6xl lg:text-7xl dark:text-stone-50">
                  A warmer, reader-facing frame for myblog002.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-stone-700 sm:text-xl dark:text-stone-300">
                  The blog now has a dedicated public route group with persistent
                  light and dark themes, a site header, and a footer ready for
                  real content pages.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
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
                <ArrowRight className="size-4" />
              </Link>
              <Link
                className={cn(
                  buttonVariants({
                    className: "rounded-full px-5",
                    size: "lg",
                    variant: "outline",
                  }),
                )}
                href="/admin/login"
              >
                Sign in
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            {highlights.map((highlight) => {
              const Icon = highlight.icon;

              return (
                <article
                  className="rounded-[1.75rem] border border-stone-300/70 bg-white/78 p-6 shadow-[0_24px_72px_rgba(71,45,17,0.12)] backdrop-blur dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.28)]"
                  key={highlight.title}
                >
                  <div className="mb-5 inline-flex rounded-2xl border border-amber-700/20 bg-amber-700/10 p-3 text-amber-800 dark:border-amber-200/20 dark:bg-amber-100/8 dark:text-amber-200">
                    <Icon className="size-5" />
                  </div>
                  <h2 className="text-xl font-semibold text-stone-950 dark:text-stone-50">
                    {highlight.title}
                  </h2>
                  <p className="mt-3 text-sm leading-6 text-stone-700 dark:text-stone-300">
                    {highlight.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}

