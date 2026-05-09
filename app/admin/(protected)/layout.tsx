import type { ReactNode } from "react";

import Link from "next/link";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { signOutAction } from "./actions";

type ProtectedAdminLayoutProps = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({
  children,
}: ProtectedAdminLayoutProps) {
  const session = await auth();

  if (session?.user?.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f7f0e5_0%,#efe1cc_100%)]">
      <header className="border-border/70 bg-background/85 sticky top-0 z-20 border-b backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="space-y-1">
            <p className="text-primary text-xs font-semibold tracking-[0.22em] uppercase">
              Admin
            </p>
            <p className="text-foreground text-sm font-medium">
              Signed in as {session.user.name}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2">
              <Link
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: "outline",
                  }),
                )}
                href="/admin"
              >
                Dashboard
              </Link>
              <Link
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: "ghost",
                  }),
                )}
                href="/"
              >
                View site
              </Link>
            </nav>

            <form action={signOutAction}>
              <button
                className={cn(
                  buttonVariants({
                    size: "sm",
                    variant: "secondary",
                  }),
                )}
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
