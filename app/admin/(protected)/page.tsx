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
  const adminName = session?.user?.name ?? "admin";

  return (
    <Card className="border-border/70 bg-card/95 w-full border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
      <CardHeader className="space-y-2">
        <CardTitle className="text-3xl">Admin dashboard</CardTitle>
        <CardDescription>
          Authentication is active. Use the dashboard navigation to manage
          posts, review editorial state, or sign out of the protected admin
          area.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-muted/60 rounded-xl border px-4 py-3">
          <p className="text-sm font-medium">
            Signed in as{" "}
            <span className="text-primary">{adminName}</span>
          </p>
        </div>

        <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 px-4 py-3 text-sm text-stone-800">
          Admin controls are enabled for {adminName}. Choose <strong>Posts</strong>{" "}
          in the header to edit content, or use <strong>Sign out</strong> to
          end this session.
        </div>
      </CardContent>
    </Card>
  );
}
