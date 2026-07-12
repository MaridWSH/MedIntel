'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchCurrentUser, logoutUser } from '@/lib/api';
import Icon from '../ui/Icon';

interface HeaderUser {
  name: string;
  email: string;
}

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<HeaderUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => setUser(data ? { name: data.name, email: data.email } : null))
      .catch(() => setUser(null))
      .finally(() => setChecking(false));
  }, []);

  const [currentHash, setCurrentHash] = useState('');

  useEffect(() => {
    const updateHash = () => setCurrentHash(window.location.hash);
    updateHash();
    window.addEventListener('hashchange', updateHash);
    return () => window.removeEventListener('hashchange', updateHash);
  }, []);

  const isActive = (href: string) => {
    const [base, hash] = href.split('#');
    if (pathname !== base) return false;
    // Account is the parent section; keep it active for every account sub-page.
    if (base === '/account' && !hash) return true;
    if (!hash) return !currentHash;
    return currentHash === `#${hash}`;
  };

  const navLinkClass = (href: string) =>
    `px-3 py-2 rounded-md transition-all duration-200 ${
      isActive(href)
        ? 'text-teal font-semibold'
        : 'text-ink-soft hover:bg-ink/5'
    }`;

  return (
    <header className="z-30 border-b border-black/10 bg-paper/95 backdrop-blur-[6px] sticky top-0">
      <div className="max-w-[1380px] mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
            <span className="text-paper text-xl font-medium tracking-tight relative serif">C</span>
            <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5" />
          </div>
          <span className="text-xl font-medium tracking-tight serif">Claritas</span>
        </a>

        {/* Primary nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          <Link href="/#how-it-works" className={navLinkClass('/#how-it-works')}>
            How it works
          </Link>
          <Link href="/search" className={navLinkClass('/search')}>
            Evidence Engine
          </Link>
          <Link href="/pricing#institutional" className={navLinkClass('/pricing#institutional')}>
            For institutions
          </Link>
          <Link href="/pricing" className={navLinkClass('/pricing')}>
            Pricing
          </Link>
          {user && (
            <Link href="/account#cme" className={navLinkClass('/account#cme')}>
              CME credits
            </Link>
          )}
          <Link href="/account" className={navLinkClass('/account')}>
            Account
          </Link>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
              <Icon icon="lucide:globe" className="text-[14px] text-teal" />
              <span>EN</span>
              <span className="text-ink/30">&middot;</span>
              <span className="text-ink/55">&Arabic;</span>
              <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/40" />
            </button>
          </div>

          {!checking && !user && (
            <>
              {/* Sign in */}
              <Link href="/login" className="hidden md:inline-flex items-center px-3 h-9 rounded-md text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
                Sign in
              </Link>

              {/* Try Free */}
              <Link href="/register" className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold btn-primary">
                Try Free
                <Icon icon="lucide:arrow-right" className="text-[14px]" />
              </Link>
            </>
          )}
          {!checking && user && (
            <button
              onClick={() => {
                logoutUser().then(() => {
                  setUser(null);
                  router.push('/');
                });
              }}
              className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors"
            >
              <Icon icon="lucide:log-out" className="text-[14px]" />
              Sign out
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
