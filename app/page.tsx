import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function HomePage() {
  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_transparent_58%)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_420px]">
          <div className="flex flex-col justify-center gap-6">
            <div className="space-y-4">
              <p className="text-primary text-sm font-semibold tracking-[0.22em] uppercase">
                Tailwind v4 + shadcn/ui
              </p>
              <div className="space-y-3">
                <h1 className="text-foreground max-w-3xl text-5xl leading-none font-semibold tracking-[-0.06em] text-balance sm:text-6xl lg:text-7xl">
                  A calm editorial foundation for myblog002.
                </h1>
                <p className="text-muted-foreground max-w-2xl text-lg leading-8 sm:text-xl">
                  Issue 2 wires in Tailwind CSS, a shared token system,
                  shadcn/ui primitives, and the linting and formatting baseline
                  for the rest of the build.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button size="lg">Preview the foundation</Button>
              <Button size="lg" variant="outline">
                Review design tokens
              </Button>
            </div>
          </div>

          <Card className="border-border/70 bg-card/90 border shadow-[0_24px_80px_rgba(86,58,20,0.14)] backdrop-blur">
            <CardHeader className="gap-2">
              <CardTitle>Component baseline</CardTitle>
              <CardDescription>
                The shared UI layer is ready for admin forms, post metadata, and
                editorial workflows.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label
                  className="text-foreground text-sm font-medium"
                  htmlFor="preview-email"
                >
                  Email capture placeholder
                </label>
                <Input
                  id="preview-email"
                  type="email"
                  placeholder="editor@example.com"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="border-border/70 bg-background/80 rounded-lg border p-4">
                  <p className="text-foreground text-sm font-medium">Tokens</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Warm neutrals, soft surfaces, strong readable contrast.
                  </p>
                </div>
                <div className="border-border/70 bg-background/80 rounded-lg border p-4">
                  <p className="text-foreground text-sm font-medium">Tooling</p>
                  <p className="text-muted-foreground mt-1 text-sm">
                    ESLint, Prettier, and Tailwind-aware formatting are wired
                    in.
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-between gap-3">
              <span className="text-muted-foreground text-sm">
                Ready for issue 3 onward.
              </span>
              <Button variant="secondary">Continue building</Button>
            </CardFooter>
          </Card>
        </div>
      </section>
    </main>
  );
}
