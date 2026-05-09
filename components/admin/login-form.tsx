"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  type LoginActionState,
  loginAction,
} from "@/app/admin/login/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button className="w-full" disabled={pending} type="submit">
      {pending ? "Signing in..." : "Sign in"}
    </Button>
  );
}

const initialLoginActionState: LoginActionState = {
  error: null,
};

type LoginFormProps = {
  callbackUrl?: string;
};

export function LoginForm({ callbackUrl = "/admin" }: LoginFormProps) {
  const [state, formAction] = useActionState(
    loginAction,
    initialLoginActionState,
  );
  const errorId = state.error ? "login-form-error" : undefined;

  return (
    <Card className="border-border/70 bg-card/95 w-full max-w-md border shadow-[0_24px_80px_rgba(73,49,19,0.14)] backdrop-blur">
      <CardHeader className="space-y-2">
        <CardTitle className="text-2xl">Admin sign in</CardTitle>
        <CardDescription>
          Use the environment-configured admin credentials to access the blog
          dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <input name="callbackUrl" type="hidden" value={callbackUrl} />

          <div className="space-y-2">
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="username"
            >
              Username
            </label>
            <Input
              autoCapitalize="none"
              autoComplete="username"
              autoFocus
              aria-describedby={errorId}
              aria-invalid={state.error ? true : undefined}
              id="username"
              name="username"
              placeholder="admin"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-foreground text-sm font-medium"
              htmlFor="password"
            >
              Password
            </label>
            <Input
              autoComplete="current-password"
              aria-describedby={errorId}
              aria-invalid={state.error ? true : undefined}
              id="password"
              name="password"
              required
              type="password"
            />
          </div>

          {state.error ? (
            <p
              aria-live="polite"
              className="border-destructive/25 bg-destructive/10 text-destructive rounded-lg border px-3 py-2 text-sm"
              id={errorId}
              role="alert"
            >
              {state.error}
            </p>
          ) : null}

          <SubmitButton />
        </form>
      </CardContent>
    </Card>
  );
}
