import { compare } from "bcryptjs";
import type { User } from "next-auth";
import { z } from "zod";

import { loadAuthEnv } from "@/lib/env";

const credentialsSchema = z.object({
  username: z.string().trim().min(1, "Username is required."),
  password: z.string().min(1, "Password is required."),
});

export async function authorizeAdminCredentials(
  credentials: Partial<Record<"username" | "password", unknown>>,
): Promise<User | null> {
  const parsedCredentials = credentialsSchema.safeParse(credentials);

  if (!parsedCredentials.success) {
    return null;
  }

  const env = loadAuthEnv();
  const usernameMatches =
    parsedCredentials.data.username === env.ADMIN_USERNAME;

  if (!usernameMatches) {
    return null;
  }

  const passwordMatches = await compare(
    parsedCredentials.data.password,
    env.ADMIN_PASSWORD_HASH,
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: "admin",
    name: env.ADMIN_USERNAME,
    role: "admin",
  };
}
