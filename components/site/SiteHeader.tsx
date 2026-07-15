'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
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
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState('');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const profileButtonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    if (!profileMenuOpen) return;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setProfileMenuOpen(false);
        profileButtonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', closeOnOutsidePress);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('pointerdown', closeOnOutsidePress);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [profileMenuOpen]);

  const handleSignOut = async () => {
    setSigningOut(true);
    setSignOutError('');
    try {
      await logoutUser();
      setUser(null);
      setProfileMenuOpen(false);
      router.push('/');
      router.refresh();
    } catch {
      setSignOutError('Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  };

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
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
            <span className="text-paper text-xl font-medium tracking-tight relative serif">C</span>
            <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5" />
          </div>
          <span className="text-xl font-medium tracking-tight serif">Claritas</span>
        </Link>

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
          <Link href="/feedback" className={navLinkClass('/feedback')}>
            Feedback
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
              <span className="text-ink/55">AR</span>
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
            <div ref={profileMenuRef} className="relative">
              <button
                ref={profileButtonRef}
                type="button"
                aria-label={`Open profile menu for ${user.name}`}
                aria-controls="profile-navigation"
                aria-expanded={profileMenuOpen}
                onClick={() => {
                  setSignOutError('');
                  setProfileMenuOpen((open) => !open);
                }}
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full border transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-deep focus-visible:ring-offset-2 focus-visible:ring-offset-paper ${
                  profileMenuOpen
                    ? 'border-teal-deep bg-teal-deep text-paper'
                    : 'border-ink/15 bg-paper text-ink-soft hover:border-teal-deep/40 hover:bg-teal-deep/8 hover:text-teal-deep'
                }`}
              >
                <Icon icon="lucide:user-round" className="text-[19px]" />
              </button>

              {profileMenuOpen && (
                <nav
                  id="profile-navigation"
                  aria-label="Profile navigation"
                  className="absolute right-0 top-[calc(100%+0.65rem)] z-50 w-64 overflow-hidden rounded-2xl border border-ink/12 bg-paper shadow-[0_24px_60px_-20px_rgba(11,29,42,0.35),0_4px_14px_-8px_rgba(11,29,42,0.2)]"
                >
                  <div className="border-b border-ink/10 bg-paper-warm/55 px-4 py-3.5">
                    <p className="truncate text-[13px] font-semibold text-ink">{user.name}</p>
                    <p className="mt-0.5 truncate text-[11px] text-ink/50">{user.email}</p>
                  </div>

                  <div className="p-2">
                    <Link
                      href="/dashboard"
                      onClick={() => setProfileMenuOpen(false)}
                      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[12.5px] font-medium transition-colors ${
                        pathname === '/dashboard'
                          ? 'bg-teal-deep/10 text-teal-deep'
                          : 'text-ink-soft hover:bg-ink/5'
                      }`}
                    >
                      <Icon icon="lucide:layout-dashboard" className="text-[16px]" />
                      Dashboard
                    </Link>
                    <Link
                      href="/search"
                      onClick={() => setProfileMenuOpen(false)}
                      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[12.5px] font-medium transition-colors ${
                        pathname === '/search'
                          ? 'bg-teal-deep/10 text-teal-deep'
                          : 'text-ink-soft hover:bg-ink/5'
                      }`}
                    >
                      <Icon icon="lucide:search" className="text-[16px]" />
                      Search
                    </Link>
                    <Link
                      href="/account"
                      onClick={() => setProfileMenuOpen(false)}
                      className={`flex h-10 items-center gap-3 rounded-xl px-3 text-[12.5px] font-medium transition-colors ${
                        pathname === '/account'
                          ? 'bg-teal-deep/10 text-teal-deep'
                          : 'text-ink-soft hover:bg-ink/5'
                      }`}
                    >
                      <Icon icon="lucide:user-round" className="text-[16px]" />
                      Account
                    </Link>

                    <div className="my-2 border-t border-ink/10" />
                    <button
                      type="button"
                      disabled={signingOut}
                      onClick={() => void handleSignOut()}
                      className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-left text-[12.5px] font-medium text-red-700 transition-colors hover:bg-red-50 disabled:cursor-wait disabled:opacity-60"
                    >
                      <Icon
                        icon={signingOut ? 'lucide:loader-2' : 'lucide:log-out'}
                        className={`text-[16px] ${signingOut ? 'animate-spin' : ''}`}
                      />
                      {signingOut ? 'Signing out…' : 'Sign out'}
                    </button>
                    {signOutError && (
                      <p role="alert" className="px-3 pb-1 pt-1 text-[10.5px] text-red-700">
                        {signOutError}
                      </p>
                    )}
                  </div>
                </nav>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
