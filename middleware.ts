import { NextResponse } from "next/server";
import NextAuth from "next-auth";

import authConfig from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const isAdminSession = request.auth?.user?.role === "admin";
  const isLoginRoute = request.nextUrl.pathname === "/admin/login";

  if (isLoginRoute) {
    if (isAdminSession) {
      return NextResponse.redirect(new URL("/admin", request.nextUrl));
    }

    return NextResponse.next();
  }

  if (!isAdminSession) {
    const loginUrl = new URL("/admin/login", request.nextUrl);

    loginUrl.searchParams.set(
      "callbackUrl",
      `${request.nextUrl.pathname}${request.nextUrl.search}`,
    );

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*"],
};
