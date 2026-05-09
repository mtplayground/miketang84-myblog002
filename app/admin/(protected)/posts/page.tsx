import Link from "next/link";

import { PostStatus } from "@prisma/client";

import { PostStatusBadge } from "@/components/admin/post-status-badge";
import { buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  type ListAllPostsOptions,
  type PostSortOption,
  listAllPosts,
} from "@/lib/posts";
import { cn } from "@/lib/utils";

type AdminPostsPageProps = {
  searchParams?: Promise<{
    q?: string | string[];
    sort?: string | string[];
    status?: string | string[];
  }>;
};

const sortOptions: Array<{
  label: string;
  value: PostSortOption;
}> = [
  {
    label: "Recently updated",
    value: "updated-desc",
  },
  {
    label: "Least recently updated",
    value: "updated-asc",
  },
  {
    label: "Newest published first",
    value: "published-desc",
  },
  {
    label: "Recently created",
    value: "created-desc",
  },
  {
    label: "Title A-Z",
    value: "title-asc",
  },
  {
    label: "Title Z-A",
    value: "title-desc",
  },
];

const statusOptions = [
  {
    label: "All statuses",
    value: "all",
  },
  {
    label: "Published",
    value: PostStatus.PUBLISHED,
  },
  {
    label: "Draft",
    value: PostStatus.DRAFT,
  },
] as const;

function readFirstParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function normalizeSearchParams(
  params: Awaited<AdminPostsPageProps["searchParams"]>,
) {
  const search = readFirstParam(params?.q)?.trim() ?? "";
  const sort = readFirstParam(params?.sort);
  const status = readFirstParam(params?.status);
  const normalizedSort = sortOptions.some((option) => option.value === sort)
    ? (sort as PostSortOption)
    : "updated-desc";
  const normalizedStatus = statusOptions.some((option) => option.value === status)
    ? status
    : "all";

  return {
    search,
    sort: normalizedSort,
    status: normalizedStatus,
  };
}

function formatDateTime(value: Date | null) {
  if (!value) {
    return "Not published";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

function formatRelativeUpdate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const resolvedSearchParams = normalizeSearchParams(await searchParams);
  const queryOptions: ListAllPostsOptions = {
    search: resolvedSearchParams.search || undefined,
    sort: resolvedSearchParams.sort,
    status:
      resolvedSearchParams.status === "all"
        ? "all"
        : (resolvedSearchParams.status as PostStatus),
  };
  const posts = await listAllPosts(queryOptions);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
            Content
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              Posts
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-stone-700">
              Review drafts and published entries, search the catalog, and jump
              directly into creating or editing articles.
            </p>
          </div>
        </div>

        <Link
          className={cn(
            buttonVariants({
              size: "lg",
            }),
          )}
          href="/admin/posts/new"
        >
          Create post
        </Link>
      </section>

      <Card className="border-border/70 bg-card/95 border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
        <CardHeader className="space-y-4">
          <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">Post library</CardTitle>
              <CardDescription>
                {posts.length} post{posts.length === 1 ? "" : "s"} match the
                current filters.
              </CardDescription>
            </div>

            <div className="text-muted-foreground text-sm">
              Sort:{" "}
              {
                sortOptions.find(
                  (option) => option.value === resolvedSearchParams.sort,
                )?.label
              }
            </div>
          </div>

          <form className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
            <Input
              defaultValue={resolvedSearchParams.search}
              name="q"
              placeholder="Search title, excerpt, content, or slug"
            />

            <label className="sr-only" htmlFor="status">
              Filter by status
            </label>
            <select
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              defaultValue={resolvedSearchParams.status}
              id="status"
              name="status"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <label className="sr-only" htmlFor="sort">
              Sort posts
            </label>
            <select
              className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
              defaultValue={resolvedSearchParams.sort}
              id="sort"
              name="sort"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <div className="flex gap-2">
              <button
                className={cn(
                  buttonVariants({
                    className: "flex-1",
                    variant: "default",
                  }),
                )}
                type="submit"
              >
                Apply
              </button>
              <Link
                className={cn(
                  buttonVariants({
                    className: "flex-1",
                    variant: "outline",
                  }),
                )}
                href="/admin/posts"
              >
                Reset
              </Link>
            </div>
          </form>
        </CardHeader>

        <CardContent>
          {posts.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-stone-300/80 bg-stone-50/90 px-6 py-14 text-center">
              <h2 className="text-xl font-semibold text-stone-900">
                No posts found
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-stone-600">
                Try widening the search or create a new post to start building
                the blog catalog.
              </p>
              <div className="mt-6 flex justify-center">
                <Link
                  className={cn(
                    buttonVariants({
                      variant: "default",
                    }),
                  )}
                  href="/admin/posts/new"
                >
                  Create the first post
                </Link>
              </div>
            </div>
          ) : (
            <div className="overflow-hidden rounded-3xl border border-stone-300/70 bg-stone-50/80">
              <div className="hidden grid-cols-[minmax(0,1.8fr)_0.9fr_0.8fr_120px] gap-6 border-b border-stone-300/70 px-6 py-4 text-xs font-semibold tracking-[0.18em] text-stone-600 uppercase md:grid">
                <div>Post</div>
                <div>Status & tags</div>
                <div>Dates</div>
                <div className="text-right">Actions</div>
              </div>

              <div className="divide-y divide-stone-300/70">
                {posts.map((post) => (
                  <article
                    className="grid gap-5 px-6 py-5 md:grid-cols-[minmax(0,1.8fr)_0.9fr_0.8fr_120px] md:items-start md:gap-6"
                    key={post.id}
                  >
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex items-start justify-between gap-3 md:block">
                          <h2 className="text-lg font-semibold text-stone-950">
                            {post.title}
                          </h2>
                          <div className="md:hidden">
                            <PostStatusBadge status={post.status} />
                          </div>
                        </div>
                        <p className="font-mono text-xs text-stone-500">
                          /{post.slug}
                        </p>
                      </div>

                      {post.excerpt ? (
                        <p className="line-clamp-2 text-sm leading-6 text-stone-700">
                          {post.excerpt}
                        </p>
                      ) : (
                        <p className="text-sm text-stone-500 italic">
                          No excerpt yet.
                        </p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="hidden md:block">
                        <PostStatusBadge status={post.status} />
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {post.tags.length > 0 ? (
                          post.tags.map((tag) => (
                            <span
                              className="rounded-full border border-stone-300/80 bg-white/85 px-2.5 py-1 text-xs font-medium text-stone-700"
                              key={tag.id}
                            >
                              {tag.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-stone-500">
                            No tags
                          </span>
                        )}
                      </div>
                    </div>

                    <dl className="grid gap-3 text-sm text-stone-700">
                      <div>
                        <dt className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                          Published
                        </dt>
                        <dd className="mt-1">{formatDateTime(post.publishedAt)}</dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                          Updated
                        </dt>
                        <dd className="mt-1">{formatRelativeUpdate(post.updatedAt)}</dd>
                      </div>
                    </dl>

                    <div className="flex items-center justify-between gap-3 md:justify-end">
                      <Link
                        className={cn(
                          buttonVariants({
                            size: "sm",
                            variant: "outline",
                          }),
                        )}
                        href={`/admin/posts/${post.id}`}
                      >
                        Edit
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
