"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import {
  type CreatePostInput,
  type PostStatus,
  createPost,
  deletePost,
  getPostById,
  updatePost,
} from "@/lib/posts";
import { revalidatePublishedContent } from "@/lib/revalidate";

export type PostFormState = {
  error: string | null;
};

type Intent = "publish" | "save" | "unpublish";

function normalizeOptionalString(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedValue = value.trim();
  return normalizedValue || null;
}

function normalizeRequiredString(fieldName: string, value: FormDataEntryValue | null) {
  const normalizedValue = normalizeOptionalString(value);

  if (!normalizedValue) {
    throw new Error(`${fieldName} is required.`);
  }

  return normalizedValue;
}

function normalizeTagInputs(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return [];
  }

  return value
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

async function requireAdminSession() {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }
}

function resolveIntent(formData: FormData): Intent {
  const intent = formData.get("intent");

  if (intent === "publish" || intent === "save" || intent === "unpublish") {
    return intent;
  }

  return "save";
}

function buildPostInput(
  formData: FormData,
  fallbackStatus: PostStatus,
): CreatePostInput & {
  regenerateSlugFromTitle: boolean;
} {
  const statusValue = formData.get("status");
  const publishDateValue = normalizeOptionalString(formData.get("publishedAt"));

  return {
    content: normalizeRequiredString("Body", formData.get("content")),
    coverImageUrl: normalizeOptionalString(formData.get("coverImageUrl")),
    excerpt: normalizeOptionalString(formData.get("excerpt")),
    publishedAt: publishDateValue ? new Date(publishDateValue) : null,
    regenerateSlugFromTitle: formData.get("regenerateSlugFromTitle") === "on",
    slug: normalizeOptionalString(formData.get("slug")) ?? undefined,
    status:
      statusValue === "PUBLISHED" || statusValue === "DRAFT"
        ? statusValue
        : fallbackStatus,
    tags: normalizeTagInputs(formData.get("tags")),
    title: normalizeRequiredString("Title", formData.get("title")),
  };
}

function revalidateAdminPostPaths(postId?: string) {
  revalidatePath("/admin");
  revalidatePath("/admin/posts");
  revalidatePath("/admin/posts/new");

  if (postId) {
    revalidatePath(`/admin/posts/${postId}`);
  }
}

export async function savePostAction(
  postId: string | null,
  _previousState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  await requireAdminSession();

  try {
    const intent = resolveIntent(formData);
    const fallbackStatus = intent === "publish" ? "PUBLISHED" : "DRAFT";
    const postInput = buildPostInput(formData, fallbackStatus);

    if (!postId) {
      const createdPost = await createPost({
        ...postInput,
        status: intent === "publish" ? "PUBLISHED" : postInput.status,
      });

      revalidateAdminPostPaths(createdPost.id);
      revalidatePublishedContent({
        nextPost: createdPost,
      });
      redirect(`/admin/posts/${createdPost.id}`);
    }

    const existingPost = await getPostById(postId);

    if (!existingPost) {
      throw new Error("Post not found.");
    }

    if (intent === "publish") {
      const updatedPost = await updatePost(postId, {
        content: postInput.content,
        coverImageUrl: postInput.coverImageUrl,
        excerpt: postInput.excerpt,
        publishedAt: postInput.publishedAt,
        regenerateSlugFromTitle: postInput.regenerateSlugFromTitle,
        slug: postInput.slug ?? undefined,
        status: "PUBLISHED",
        tags: postInput.tags,
        title: postInput.title,
      });

      revalidateAdminPostPaths(updatedPost.id);
      revalidatePublishedContent({
        nextPost: updatedPost,
        previousPost: existingPost,
      });
      redirect(`/admin/posts/${updatedPost.id}`);
    }

    if (intent === "unpublish") {
      const updatedPost = await updatePost(postId, {
        content: postInput.content,
        coverImageUrl: postInput.coverImageUrl,
        excerpt: postInput.excerpt,
        publishedAt: null,
        regenerateSlugFromTitle: postInput.regenerateSlugFromTitle,
        slug: postInput.slug ?? undefined,
        status: "DRAFT",
        tags: postInput.tags,
        title: postInput.title,
      });

      revalidateAdminPostPaths(updatedPost.id);
      revalidatePublishedContent({
        nextPost: updatedPost,
        previousPost: existingPost,
      });
      redirect(`/admin/posts/${updatedPost.id}`);
    }

    const updatedPost = await updatePost(postId, {
      content: postInput.content,
      coverImageUrl: postInput.coverImageUrl,
      excerpt: postInput.excerpt,
      publishedAt: postInput.publishedAt,
      regenerateSlugFromTitle: postInput.regenerateSlugFromTitle,
      slug: postInput.slug ?? undefined,
      status: postInput.status,
      tags: postInput.tags,
      title: postInput.title,
    });

    revalidateAdminPostPaths(updatedPost.id);
    revalidatePublishedContent({
      nextPost: updatedPost,
      previousPost: existingPost,
    });
    redirect(`/admin/posts/${updatedPost.id}`);
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to save the post right now.",
    };
  }
}

export async function deletePostAction(postId: string) {
  await requireAdminSession();

  const existingPost = await getPostById(postId);
  await deletePost(postId);
  revalidateAdminPostPaths(postId);
  revalidatePublishedContent({
    previousPost: existingPost,
  });
  redirect("/admin/posts");
}
