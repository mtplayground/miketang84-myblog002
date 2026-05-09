"use client";

import { ErrorState } from "@/components/fallbacks/error-state";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <ErrorState
      description="The admin route failed while loading session data or editorial state. Retry the request or return to the dashboard."
      homeHref="/admin"
      homeLabel="Admin dashboard"
      reset={reset}
      title="The admin route could not be rendered."
    />
  );
}
