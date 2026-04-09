"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!authService.isAuthenticated()) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/auth/login${next}`);
    }
  }, [mounted, router, pathname]);

  // Prevent hydration mismatches by rendering nothing until mounted.
  if (!mounted) return null;
  if (!authService.isAuthenticated()) return null;
  return <>{children}</>;
}

