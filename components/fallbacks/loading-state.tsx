type LoadingStateProps = {
  description: string;
  eyebrow: string;
  title: string;
};

export function LoadingState({
  description,
  eyebrow,
  title,
}: LoadingStateProps) {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[24rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),transparent_62%)] dark:bg-[radial-gradient(circle_at_top,rgba(210,180,140,0.1),transparent_52%)]" />

      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <p className="text-sm font-semibold tracking-[0.24em] text-amber-700 uppercase dark:text-amber-300">
            {eyebrow}
          </p>
          <div className="space-y-3">
            <div className="h-12 w-full max-w-3xl animate-pulse rounded-full bg-stone-300/70 dark:bg-white/10" />
            <div className="h-6 w-full max-w-2xl animate-pulse rounded-full bg-stone-300/55 dark:bg-white/8" />
          </div>
          <p className="max-w-2xl text-sm leading-7 text-stone-700 dark:text-stone-300">
            {description}
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }, (_, index) => (
            <div
              className="rounded-[1.8rem] border border-stone-300/70 bg-white/75 p-6 shadow-[0_20px_60px_rgba(71,45,17,0.1)] dark:border-white/10 dark:bg-white/6"
              key={index}
            >
              <div className="space-y-4">
                <div className="h-4 w-24 animate-pulse rounded-full bg-stone-300/65 dark:bg-white/10" />
                <div className="h-8 w-4/5 animate-pulse rounded-2xl bg-stone-300/65 dark:bg-white/10" />
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded-full bg-stone-300/55 dark:bg-white/8" />
                  <div className="h-4 w-11/12 animate-pulse rounded-full bg-stone-300/55 dark:bg-white/8" />
                  <div className="h-4 w-4/5 animate-pulse rounded-full bg-stone-300/55 dark:bg-white/8" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <span className="sr-only">{title}</span>
      </div>
    </div>
  );
}
