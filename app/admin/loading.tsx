import { LoadingState } from "@/components/fallbacks/loading-state";

export default function AdminLoading() {
  return (
    <LoadingState
      description="Loading authentication state, admin navigation, and editorial data."
      eyebrow="Admin"
      title="Loading admin routes"
    />
  );
}
