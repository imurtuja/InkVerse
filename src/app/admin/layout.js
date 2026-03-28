import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

/**
 * Every /admin request is verified on the server. Only users with role "admin" in the database can enter; role is never assignable via API/UI.
 */
export default async function AdminLayout({ children }) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/admin");
  }
  if (session.user.role !== "admin") {
    redirect("/feed");
  }
  return <>{children}</>;
}
