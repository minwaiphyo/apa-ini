"use client";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { UserRole } from "@/lib/types";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && session?.user) {
      const role = session.user.role as UserRole;

      // Route based on role
      const roleRoutes: Record<UserRole, string> = {
        PARTICIPANT: "/participant",
        VOLUNTEER: "/volunteer",
        STAFF: "/staff",
      };

      const targetRoute = roleRoutes[role] || "/participant";
      router.push(targetRoute);
    }
  }, [session, status, router]);

  // Show loading state while redirecting
  return (
    <div style={{ padding: 24, textAlign: "center" }}>
      <p>Loading your dashboard...</p>
    </div>
  );
}
