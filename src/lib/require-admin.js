import { auth } from "@/lib/auth";

/**
 * Server-only guard for admin APIs. The `admin` role cannot be granted via app code: User schema blocks it on save/update; only MongoDB shell GUI may set `role`.
 */
export async function requireAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { ok: false, status: 401, session: null };
  }
  if (session.user.role !== "admin") {
    return { ok: false, status: 403, session: null };
  }
  return { ok: true, status: null, session };
}
