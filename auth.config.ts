import type { NextAuthConfig } from "next-auth";

const authConfig = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [],
  session: {
    strategy: "jwt",
  },
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
} satisfies NextAuthConfig;

export default authConfig;
