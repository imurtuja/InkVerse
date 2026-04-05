import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/login", "/signup", "/privacy", "/terms", "/about", "/contact", "/reset-password", "/verify"];
const AUTH_PATHS = ["/login", "/signup"];

export default auth((req) => {
  const { nextUrl: url, auth: session } = req;
  const isPublic = PUBLIC_PATHS.includes(url.pathname);
  const isAuthPath = AUTH_PATHS.includes(url.pathname);

  // 1. Always allow API routes for internal logic (auth/reports/etc)
  if (url.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 2. Banning Enforcement (Authenticated Users)
  if (session?.user?.isBanned) {
    const expires = session.user.banExpiresAt ? new Date(session.user.banExpiresAt) : null;
    const stillActive = !expires || expires > new Date();

    if (stillActive && !url.pathname.startsWith("/banned")) {
      return NextResponse.redirect(new URL("/banned", req.url));
    }
    // If banned, user IS allowed to stay on /banned
    if (stillActive && url.pathname.startsWith("/banned")) {
      return NextResponse.next();
    }
  }

  // 3. Unbanned user trying to manually access /banned
  if (!session?.user?.isBanned && url.pathname.startsWith("/banned")) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }

  // 4. Guest Access Control (The "Walled Garden")
  if (!session && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 5. Authenticated users already at login/signup
  if (session && isAuthPath) {
    return NextResponse.redirect(new URL("/feed", req.url));
  }
  
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon).*)"],
};
