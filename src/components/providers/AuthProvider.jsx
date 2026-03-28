"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }) {
  return <SessionProvider basePath="/api/auth">{children}</SessionProvider>;
}
