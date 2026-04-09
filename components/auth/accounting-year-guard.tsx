"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

function isAdminPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return pathname === "/admin" || pathname.startsWith("/admin/");
}

export function AccountingYearGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (!authService.isAuthenticated()) return;
    if (isAdminPath(pathname)) return;

    const year = authService.getAccountingYear();
    if (!year) {
      const next = pathname && pathname !== "/" ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/admin/accounting-years${next}`);
    }
  }, [mounted, router, pathname]);

  if (!mounted) return null;
  if (!authService.isAuthenticated()) return null;
  if (isAdminPath(pathname)) return <>{children}</>;

  const year = authService.getAccountingYear();
  if (!year) return null;
  return <>{children}</>;
}

