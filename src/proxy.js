import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/feed", "/post", "/profile", "/notifications", "/settings", "/admin"];
const authRoutes = ["/login", "/signup"];

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth?.user);
  const isProtected = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => nextUrl.pathname.startsWith(route));

  if (isProtected && !isLoggedIn) {
    return NextResponse.redirect(new URL("/login", nextUrl));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/feed", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
