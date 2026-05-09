import { auth } from "@/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function AdminPage() {
  const session = await auth();

  return (
    <Card className="border-border/70 bg-card/95 w-full border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl">Admin home</CardTitle>
        <CardDescription>
          Authentication is active and admin routes are now gated behind a
          session-aware layout plus middleware checks.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/60 rounded-xl border px-4 py-3">
          <p className="text-sm font-medium">
            Signed in as{" "}
            <span className="text-primary">
              {session?.user?.name ?? "guest"}
            </span>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
