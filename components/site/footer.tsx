import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-300/65 bg-white/68 dark:border-white/10 dark:bg-stone-950/60">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8 dark:text-stone-300">
        <div className="space-y-1">
          <p className="font-semibold text-stone-900 dark:text-stone-100">
            myblog002
          </p>
          <p>
            Public reading surfaces are being layered in step by step on top of
            the editorial admin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <Link className="transition hover:text-stone-900 dark:hover:text-stone-50" href="/">
            Home
          </Link>
          <Link
            className="transition hover:text-stone-900 dark:hover:text-stone-50"
            href="/admin/login"
          >
            Admin
          </Link>
          <span>{new Date().getUTCFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

