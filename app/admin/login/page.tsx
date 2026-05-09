import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { LoginForm } from "@/components/admin/login-form";

type AdminLoginPageProps = {
  searchParams?: Promise<{
    callbackUrl?: string;
  }>;
};

function getSafeCallbackUrl(callbackUrl: string | undefined) {
  if (callbackUrl?.startsWith("/admin")) {
    return callbackUrl;
  }

  return "/admin";
}

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const session = await auth();
  const resolvedSearchParams = await searchParams;
  const callbackUrl = getSafeCallbackUrl(resolvedSearchParams?.callbackUrl);

  if (session?.user?.role === "admin") {
    redirect(callbackUrl);
  }

  return (
    <main className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.94),_transparent_62%)]" />
      <section className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid w-full items-center gap-10 lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="space-y-5">
            <p className="text-primary text-sm font-semibold tracking-[0.24em] uppercase">
              Administration
            </p>
            <div className="space-y-4">
              <h1 className="text-foreground max-w-3xl text-5xl leading-none font-semibold tracking-[-0.06em] text-balance sm:text-6xl">
                Sign in to manage posts, tags, and publishing workflows.
              </h1>
              <p className="text-muted-foreground max-w-2xl text-lg leading-8 sm:text-xl">
                This login is backed by Auth.js credentials auth and validates
                the environment-configured admin account without storing
                passwords in the database.
              </p>
            </div>
          </div>

          <LoginForm callbackUrl={callbackUrl} />
        </div>
      </section>
    </main>
  );
}
