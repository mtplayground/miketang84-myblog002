import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NotFoundState() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.1),transparent_52%)]" />

      <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full rounded-[2rem] border border-stone-300/70 bg-white/80 p-8 shadow-[0_24px_72px_rgba(71,45,17,0.12)] dark:border-white/10 dark:bg-white/6 dark:shadow-[0_24px_72px_rgba(0,0,0,0.24)]">
          <p className="text-sm font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
            404
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-stone-950 dark:text-stone-50">
            The page you requested does not exist.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-8 text-stone-700 dark:text-stone-300">
            The link may be stale, the content may have moved, or the route was
            never published. Use one of the known entry points below instead of
            guessing the path.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              className={cn(
                buttonVariants({
                  className: "rounded-full px-5",
                }),
              )}
              href="/"
            >
              Return home
            </Link>
            <Link
              className={cn(
                buttonVariants({
                  className: "rounded-full px-5",
                  variant: "outline",
                }),
              )}
              href="/about"
            >
              Visit about
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
