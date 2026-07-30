'use client';

import SiteHeader from '@/components/site/SiteHeader';
import AdminNav from './AdminNav';

interface AdminShellProps {
  children: React.ReactNode;
}

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <>
      <SiteHeader />
      <div className="flex min-h-[calc(100vh-68px)] flex-col bg-paper-warm/30 lg:flex-row">
        <AdminNav />
        <main className="flex-1">
          {children}
        </main>
      </div>
    </>
  );
}
