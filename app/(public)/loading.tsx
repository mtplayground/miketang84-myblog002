import { LoadingState } from "@/components/fallbacks/loading-state";

export default function PublicLoading() {
  return (
    <LoadingState
      description="Loading the latest public content, topic pages, and article data."
      eyebrow="Public"
      title="Loading public routes"
    />
  );
}
