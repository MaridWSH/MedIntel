'use client';

import Link from 'next/link';
import Icon from '@/components/ui/Icon';

export default function AdminDashboardPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[10px] mono-stat text-teal-deep">
          <Icon icon="lucide:lock" className="text-[13px]" />
          ADMINISTRATOR VIEW
        </div>
        <h1 className="display text-[34px] sm:text-[42px] lg:text-[50px]">Admin dashboard</h1>
        <p className="mt-3 max-w-[700px] text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
          Manage users, review platform analytics, and inspect survey responses.
        </p>
      </header>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/users"
          className="rounded-2xl border border-ink/12 bg-paper p-6 transition-colors hover:border-teal-deep/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
            <Icon icon="lucide:users" className="text-[18px]" />
          </div>
          <h2 className="mt-4 text-[15px] font-semibold">Users</h2>
          <p className="mt-1 text-[12px] text-ink-soft">View and manage accounts.</p>
        </Link>

        <Link
          href="/admin/analytics"
          className="rounded-2xl border border-ink/12 bg-paper p-6 transition-colors hover:border-teal-deep/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
            <Icon icon="lucide:trending-up" className="text-[18px]" />
          </div>
          <h2 className="mt-4 text-[15px] font-semibold">Analytics</h2>
          <p className="mt-1 text-[12px] text-ink-soft">Platform usage and trends.</p>
        </Link>

        <Link
          href="/admin/responses"
          className="rounded-2xl border border-ink/12 bg-paper p-6 transition-colors hover:border-teal-deep/30"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-deep/10 text-teal-deep">
            <Icon icon="lucide:clipboard-list" className="text-[18px]" />
          </div>
          <h2 className="mt-4 text-[15px] font-semibold">Survey responses</h2>
          <p className="mt-1 text-[12px] text-ink-soft">Research and product feedback.</p>
        </Link>
      </section>
    </div>
  );
}
