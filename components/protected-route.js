"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth-provider";
import { Skeleton } from "@/components/ui/skeleton";

export function ProtectedRoute({ allowedRoles = [], children }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isReady } = useAuth();

  useEffect(() => {
    if (!isReady) return;

    if (!user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      const fallback = user.role === "CUSTOMER" ? "/customer" : user.role === "RIDER" ? "/rider" : "/admin";
      router.replace(fallback);
    }
  }, [isReady, pathname, router, user, allowedRoles]);

  if (!isReady || !user) {
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-64 w-full max-w-xl rounded-2xl" /></div>;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-64 w-full max-w-xl rounded-2xl" /></div>;
  }

  return children;
}
