import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

const protectedRoutes = ["/feed", "/post", "/profile", "/notifications", "/settings", "/admin"];
const authRoutes = ["/login", "/signup"];

export const proxy = auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth?.user);
  const isProtected = protectedRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => nextUrl.pathname.startsWith(route));
  const isAdminPath = nextUrl.pathname.startsWith("/admin");

  if (isAdminPath) {
    if (!isLoggedIn) {
      const login = new URL("/login", nextUrl);
      login.searchParams.set("callbackUrl", "/admin");
      return NextResponse.redirect(login);
    }
    if (req.auth?.user?.role !== "admin") {
      return NextResponse.redirect(new URL("/feed", nextUrl));
    }
    return NextResponse.next();
  }

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
