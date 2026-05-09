"use client";

import { ErrorState } from "@/components/fallbacks/error-state";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      description="The public page failed while loading its content or metadata. Retry the request or jump back to a stable route."
      homeHref="/"
      homeLabel="Return home"
      reset={reset}
      title="This public page could not be rendered."
    />
  );
}
