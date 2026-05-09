import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { authorizeAdminCredentials } from "@/lib/auth";
import { loadAuthEnv } from "@/lib/env";

export const { handlers, auth, signIn, signOut } = NextAuth(() => {
  const env = loadAuthEnv();

  return {
    secret: env.NEXTAUTH_SECRET,
    session: {
      strategy: "jwt",
    },
    providers: [
      Credentials({
        name: "Admin credentials",
        credentials: {
          username: {
            label: "Username",
            type: "text",
          },
          password: {
            label: "Password",
            type: "password",
          },
        },
        authorize: authorizeAdminCredentials,
      }),
    ],
    callbacks: {
      async jwt({ token, user }) {
        if (user) {
          token.sub = user.id;
          token.name = user.name;
          token.role = user.role;
        }

        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.sub ?? "admin";
          session.user.name = token.name ?? session.user.name ?? "admin";
          session.user.role = token.role === "admin" ? "admin" : "admin";
        }

        return session;
      },
    },
  };
});
