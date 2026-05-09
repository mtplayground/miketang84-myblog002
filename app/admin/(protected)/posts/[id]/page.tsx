import Link from "next/link";
import { notFound } from "next/navigation";

import { deletePostAction } from "@/app/admin/(protected)/posts/actions";
import { PostEditorForm } from "@/components/admin/post-editor-form";
import { buttonVariants } from "@/components/ui/button";
import { getPostById } from "@/lib/posts";
import { cn } from "@/lib/utils";

type EditPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const post = await getPostById(id);

  if (!post) {
    notFound();
  }

  const boundDeleteAction = deletePostAction.bind(null, post.id);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link
          className={cn(
            buttonVariants({
              variant: "outline",
            }),
          )}
          href="/admin/posts"
        >
          Back to posts
        </Link>

        <form action={boundDeleteAction}>
          <button
            className={cn(
              buttonVariants({
                variant: "destructive",
              }),
            )}
            type="submit"
          >
            Delete post
          </button>
        </form>
      </div>

      <PostEditorForm mode="edit" post={post} />
    </div>
  );
}

