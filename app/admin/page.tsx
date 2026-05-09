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
    <main className="mx-auto flex min-h-screen w-full max-w-5xl items-center px-4 py-16 sm:px-6 lg:px-8">
      <Card className="border-border/70 bg-card/95 w-full border shadow-[0_20px_64px_rgba(73,49,19,0.12)]">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl">Admin home</CardTitle>
          <CardDescription>
            Authentication is active. The protected admin shell and route
            guarding will be added next.
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
          <p className="text-muted-foreground text-sm leading-7">
            This page exists so successful credentials sign-in has a concrete
            destination before the dedicated admin layout and middleware land.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
