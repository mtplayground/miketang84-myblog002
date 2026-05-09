import { PostStatus } from "@prisma/client";

import { cn } from "@/lib/utils";

type PostStatusBadgeProps = {
  status: PostStatus;
};

const badgeCopy = {
  [PostStatus.DRAFT]: "Draft",
  [PostStatus.PUBLISHED]: "Published",
} as const;

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-semibold tracking-[0.16em] uppercase",
        status === PostStatus.PUBLISHED
          ? "border-emerald-500/30 bg-emerald-500/12 text-emerald-900"
          : "border-amber-800/20 bg-amber-700/10 text-amber-900",
      )}
    >
      {badgeCopy[status]}
    </span>
  );
}

