'use client';

import Icon from '@/components/ui/Icon';

export default function AdminUsersPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-10">
      <header className="mb-8">
        <div className="mb-3 flex items-center gap-2 text-[10px] mono-stat text-teal-deep">
          <Icon icon="lucide:lock" className="text-[13px]" />
          ADMINISTRATOR VIEW
        </div>
        <h1 className="display text-[34px] sm:text-[42px] lg:text-[50px]">User management</h1>
        <p className="mt-3 max-w-[700px] text-[13px] leading-relaxed text-ink-soft sm:text-[14px]">
          Search, promote, and manage registered accounts.
        </p>
      </header>

      <div className="rounded-2xl border border-ink/12 bg-paper p-8 text-center">
        <Icon icon="lucide:users" className="mx-auto text-[32px] text-ink/25" />
        <h2 className="mt-4 text-[17px] font-semibold">User management coming soon</h2>
        <p className="mt-2 text-[12px] text-ink-soft">
          This page will be implemented in the next phase.
        </p>
      </div>
    </div>
  );
}
