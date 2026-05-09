"use client";

import { type ReactNode, useActionState } from "react";
import { useFormStatus } from "react-dom";

import { PostStatus } from "@prisma/client";

import {
  type PostFormState,
  savePostAction,
} from "@/app/admin/(protected)/posts/actions";
import { MarkdownEditor } from "@/components/editor/markdown-editor";
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
import { type PostRecord } from "@/lib/posts";
import { cn } from "@/lib/utils";

type PostEditorFormProps = {
  mode: "create" | "edit";
  post?: PostRecord;
};

const initialFormState: PostFormState = {
  error: null,
};

type SubmitButtonProps = {
  children: ReactNode;
  intent: "publish" | "save" | "unpublish";
  variant?: "default" | "outline" | "secondary";
};

function SubmitButton({
  children,
  intent,
  variant = "default",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      className={cn(
        buttonVariants({
          variant,
        }),
      )}
      disabled={pending}
      name="intent"
      type="submit"
      value={intent}
    >
      {pending ? "Saving..." : children}
    </button>
  );
}

function formatDateTimeLocal(value: Date | null) {
  if (!value) {
    return "";
  }

  const timezoneOffset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - timezoneOffset).toISOString().slice(0, 16);
}

function formatTags(tags: PostRecord["tags"]) {
  return tags.map((tag) => tag.name).join(", ");
}

export function PostEditorForm({ mode, post }: PostEditorFormProps) {
  const boundAction = savePostAction.bind(null, post?.id ?? null);
  const [state, formAction] = useActionState<PostFormState, FormData>(
    boundAction,
    initialFormState,
  );

  return (
    <form action={formAction} className="space-y-8">
      <section className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-3">
          <p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
            Editor
          </p>
          <div className="space-y-2">
            <h1 className="text-4xl font-semibold tracking-tight text-stone-950">
              {mode === "create" ? "Create post" : "Edit post"}
            </h1>
            <p className="max-w-3xl text-sm leading-6 text-stone-700">
              Manage metadata, cover art, tags, publication settings, and the
              full markdown body from one place.
            </p>
          </div>
        </div>

        {post ? <PostStatusBadge status={post.status} /> : null}
      </section>

      {state.error ? (
        <div className="rounded-2xl border border-rose-300/70 bg-rose-50/90 px-4 py-3 text-sm text-rose-800">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.6fr)_360px]">
        <Card className="border-border/70 bg-card/95 border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Post content</CardTitle>
            <CardDescription>
              The body editor serializes directly to markdown and supports
              inline image uploads through the admin upload API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="title"
                >
                  Title
                </label>
                <Input
                  defaultValue={post?.title ?? ""}
                  id="title"
                  name="title"
                  placeholder="The article title"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="slug"
                >
                  Slug
                </label>
                <Input
                  defaultValue={post?.slug ?? ""}
                  id="slug"
                  name="slug"
                  placeholder="optional-custom-slug"
                />
              </div>

              <label className="flex items-center gap-3 self-end rounded-2xl border border-stone-300/70 bg-stone-50/80 px-4 py-3 text-sm text-stone-700">
                <input
                  className="accent-[--color-primary]"
                  name="regenerateSlugFromTitle"
                  type="checkbox"
                />
                Regenerate slug from title when saving
              </label>

              <div className="space-y-2 md:col-span-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="excerpt"
                >
                  Excerpt
                </label>
                <textarea
                  className="border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring min-h-28 w-full rounded-2xl border px-4 py-3 text-sm leading-6 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  defaultValue={post?.excerpt ?? ""}
                  id="excerpt"
                  name="excerpt"
                  placeholder="A short summary that will appear in listings and previews."
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="coverImageUrl"
                >
                  Cover image URL
                </label>
                <Input
                  defaultValue={post?.coverImageUrl ?? ""}
                  id="coverImageUrl"
                  name="coverImageUrl"
                  placeholder="https://cdn.example.com/cover.jpg"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="tags"
                >
                  Tags
                </label>
                <Input
                  defaultValue={post ? formatTags(post.tags) : ""}
                  id="tags"
                  name="tags"
                  placeholder="nextjs, prisma, deployment"
                />
                <p className="text-sm text-stone-500">
                  Enter a comma-separated list. Existing tags are reused and new
                  tags are created automatically.
                </p>
              </div>
            </div>

            <MarkdownEditor
              description="Write the body in rich text while keeping live markdown output visible below."
              initialMarkdown={post?.content ?? ""}
              label="Body"
              name="content"
            />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="border-border/70 bg-card/95 border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Publishing</CardTitle>
              <CardDescription>
                Control whether the post stays in draft or is considered
                published, and set an explicit publish date if needed.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="status"
                >
                  Publish state
                </label>
                <select
                  className="border-input bg-background ring-offset-background focus-visible:ring-ring flex h-10 w-full rounded-2xl border px-3 py-2 text-sm focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
                  defaultValue={post?.status ?? PostStatus.DRAFT}
                  id="status"
                  name="status"
                >
                  <option value={PostStatus.DRAFT}>Draft</option>
                  <option value={PostStatus.PUBLISHED}>Published</option>
                </select>
              </div>

              <div className="space-y-2">
                <label
                  className="text-sm font-semibold tracking-[0.16em] text-stone-700 uppercase"
                  htmlFor="publishedAt"
                >
                  Publish date
                </label>
                <Input
                  defaultValue={formatDateTimeLocal(post?.publishedAt ?? null)}
                  id="publishedAt"
                  name="publishedAt"
                  type="datetime-local"
                />
              </div>

              {post ? (
                <dl className="grid gap-3 rounded-2xl border border-stone-300/70 bg-stone-50/80 px-4 py-4 text-sm text-stone-700">
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                      Created
                    </dt>
                    <dd className="mt-1">
                      {post.createdAt.toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold tracking-[0.16em] text-stone-500 uppercase">
                      Last updated
                    </dt>
                    <dd className="mt-1">
                      {post.updatedAt.toLocaleString("en-US", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </dd>
                  </div>
                </dl>
              ) : null}
            </CardContent>
          </Card>

          <Card className="border-border/70 bg-card/95 border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Actions</CardTitle>
              <CardDescription>
                Save changes, publish immediately, or unpublish the post without
                leaving the editor.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <SubmitButton intent="save">
                {mode === "create" ? "Create draft" : "Save changes"}
              </SubmitButton>
              <SubmitButton intent="publish" variant="secondary">
                Publish
              </SubmitButton>
              {post ? (
                <SubmitButton intent="unpublish" variant="outline">
                  Unpublish
                </SubmitButton>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </form>
  );
}
