"use client";

import { SessionProvider } from "next-auth/react";

export function AuthProvider({ children }) {
  return (
    <SessionProvider basePath="/api/auth" refetchInterval={0} refetchOnWindowFocus={true}>
      {children}
    </SessionProvider>
  );
}
