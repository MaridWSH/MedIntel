'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/Icon';

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: 'lucide:layout-dashboard' },
  { href: '/admin/users', label: 'Users', icon: 'lucide:users' },
  { href: '/admin/analytics', label: 'Analytics', icon: 'lucide:trending-up' },
  { href: '/admin/responses', label: 'Responses', icon: 'lucide:clipboard-list' },
];

export default function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-ink/10 bg-paper lg:border-b-0 lg:border-r lg:w-64 lg:min-h-[calc(100vh-68px)]">
      <div className="flex gap-1 overflow-x-auto px-4 py-3 lg:flex-col lg:gap-1 lg:p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2.5 text-[13px] font-medium transition-colors lg:w-full ${
                isActive
                  ? 'bg-teal-deep/10 text-teal-deep'
                  : 'text-ink-soft hover:bg-ink/5'
              }`}
            >
              <Icon icon={item.icon} className="text-[16px]" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
