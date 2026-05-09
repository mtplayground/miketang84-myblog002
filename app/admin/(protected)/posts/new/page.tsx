import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { PostEditorForm } from "@/components/admin/post-editor-form";
import { cn } from "@/lib/utils";

export default function NewPostPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
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
      </div>

      <PostEditorForm mode="create" />
    </div>
  );
}

