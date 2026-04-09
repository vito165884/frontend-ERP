'use client';

import { MainLayout } from '@/components/layout/main-layout';
import { AuthGuard } from '@/components/auth/auth-guard';
import { AccountingYearGuard } from '@/components/auth/accounting-year-guard';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <AccountingYearGuard>
        <MainLayout>{children}</MainLayout>
      </AccountingYearGuard>
    </AuthGuard>
  );
}
