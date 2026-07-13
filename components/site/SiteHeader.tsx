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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTotal, setSearchTotal] = useState<number | null>(null);

  // Listen for search results to update the paper count
  useEffect(() => {
    const handleSearchUpdate = (e: CustomEvent<{ total: number }>) => {
      setSearchTotal(e.detail.total);
    };
    window.addEventListener('searchResultsUpdated', handleSearchUpdate as EventListener);
    return () => window.removeEventListener('searchResultsUpdated', handleSearchUpdate as EventListener);
  }, []);

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

  const navItems = (
    <>
      <Link href="/#how-it-works" className={navLinkClass('/#how-it-works')} onClick={() => setMobileMenuOpen(false)}>
        How it works
      </Link>
      <Link href="/search" className={navLinkClass('/search')} onClick={() => setMobileMenuOpen(false)}>
        Evidence Engine
      </Link>
      <Link href="/pricing#institutional" className={navLinkClass('/pricing#institutional')} onClick={() => setMobileMenuOpen(false)}>
        For institutions
      </Link>
      <Link href="/pricing" className={navLinkClass('/pricing')} onClick={() => setMobileMenuOpen(false)}>
        Pricing
      </Link>
      {user && (
        <Link href="/account#cme" className={navLinkClass('/account#cme')} onClick={() => setMobileMenuOpen(false)}>
          CME credits
        </Link>
      )}
      <Link href="/account" className={navLinkClass('/account')} onClick={() => setMobileMenuOpen(false)}>
        Account
      </Link>
    </>
  );

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

        {/* Primary nav — Desktop */}
        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          {navItems}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Papers count badge */}
          {searchTotal !== null && (
            <span className="hidden md:flex items-center gap-1.5 px-2.5 h-8 rounded-full bg-teal/10 text-teal text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-bright animate-pulse" />
              {searchTotal.toLocaleString()} papers synthesised
            </span>
          )}

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

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md border border-ink/15 hover:bg-ink/5 transition-colors"
            aria-label="Toggle menu"
          >
            <Icon icon={mobileMenuOpen ? 'lucide:x' : 'lucide:menu'} className="text-[18px]" />
          </button>

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
              className="hidden md:inline-flex items-center gap-1.5 px-4 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors"
            >
              <Icon icon="lucide:log-out" className="text-[14px]" />
              Sign out
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-black/10 bg-paper/95 backdrop-blur-[6px]">
          <nav className="max-w-[1380px] mx-auto px-6 py-3 flex flex-col gap-1 text-[13.5px]">
            {navItems}
            <div className="pt-2 mt-2 border-t border-black/10 flex flex-col gap-2">
              {!checking && !user && (
                <>
                  <Link href="/login" className="px-3 py-2 rounded-md text-[12.5px] font-medium hover:bg-ink/5 transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold btn-primary" onClick={() => setMobileMenuOpen(false)}>
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
                    setMobileMenuOpen(false);
                  }}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors"
                >
                  <Icon icon="lucide:log-out" className="text-[14px]" />
                  Sign out
                </button>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}