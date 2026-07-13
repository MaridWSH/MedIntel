"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import TopUtilityStrip from "@/components/site/TopUtilityStrip";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { fetchCurrentUser, logoutUser } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

export default function AccountPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCurrentUser()
      .then((data) => {
        if (data) {
          setUser(data);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logoutUser();
  };

  if (loading) {
    return (
      <>
        <TopUtilityStrip />
        <SiteHeader />
        <main className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-ink/15 border-t-teal rounded-full animate-spin" />
            <p className="text-[13px] text-ink/50 mono-stat">Loading...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user) {
    return null; // Redirect handled in useEffect
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />

      <main className="relative max-w-[1080px] mx-auto px-6 py-10 lg:py-14">
        {/* Page header */}
        <header className="mb-10">
          <div className="mono-stat text-teal-deep mb-4">§ ACCOUNT</div>
          <h1 className="display text-[40px] md:text-[56px] tracking-tight">
            Welcome back<span className="italic text-teal">.</span>
          </h1>
          <p className="serif-body text-[16px] text-ink-soft leading-[1.5] mt-3 max-w-[560px]">
            Manage your account settings and preferences.
          </p>
        </header>

        {/* Profile section */}
        <section className="space-y-6">
          <div className="bg-paper border border-ink/12 rounded-2xl p-6 md:p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-teal-deep/20 border-2 border-teal-deep/40 flex items-center justify-center text-[24px] font-semibold text-teal-deep serif">
                {user.name?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <h2 className="serif text-[24px] tracking-tight">{user.name}</h2>
                <p className="text-[13px] text-ink-soft mt-1">{user.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="text-[11px] font-medium text-ink-soft mb-2 block">Full name</label>
                <input
                  type="text"
                  value={user.name}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl bg-paper-warm border border-ink/12 text-[13px] text-ink"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-soft mb-2 block">Email</label>
                <input
                  type="email"
                  value={user.email}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl bg-paper-warm border border-ink/12 text-[13px] text-ink"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-soft mb-2 block">Member since</label>
                <input
                  type="text"
                  value={new Date(user.created_at).toLocaleDateString()}
                  readOnly
                  className="w-full h-11 px-4 rounded-xl bg-paper-warm border border-ink/12 text-[13px] text-ink"
                />
              </div>
              <div>
                <label className="text-[11px] font-medium text-ink-soft mb-2 block">Password</label>
                <Link
                  href="/reset-password"
                  className="inline-flex items-center gap-2 h-11 px-4 rounded-xl bg-paper-warm border border-ink/12 text-[13px] text-teal-deep hover:bg-paper border-teal-deep/30 transition-colors"
                >
                  <Icon icon="lucide:key-round" className="text-[14px]" />
                  Change password
                </Link>
              </div>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-paper border border-ink/12 rounded-2xl p-6">
            <h3 className="text-[11px] mono-stat text-ink/45 mb-4">QUICK ACTIONS</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Link
                href="/search"
                className="flex items-center gap-3 p-4 rounded-xl bg-paper-warm border border-ink/10 hover:border-teal-deep/30 hover:bg-paper transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                  <Icon icon="lucide:search" className="text-[18px] text-teal-deep" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-ink">Search papers</div>
                  <div className="text-[11px] text-ink/55">Browse the evidence library</div>
                </div>
              </Link>
              <Link
                href="/pricing"
                className="flex items-center gap-3 p-4 rounded-xl bg-paper-warm border border-ink/10 hover:border-teal-deep/30 hover:bg-paper transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                  <Icon icon="lucide:credit-card" className="text-[18px] text-teal-deep" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-ink">View pricing</div>
                  <div className="text-[11px] text-ink/55">Upgrade your plan</div>
                </div>
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-4 rounded-xl bg-paper-warm border border-ink/10 hover:border-red-200 hover:bg-red-50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-lg bg-red-100 border border-red-200 flex items-center justify-center">
                  <Icon icon="lucide:log-out" className="text-[18px] text-red-600" />
                </div>
                <div>
                  <div className="text-[13px] font-medium text-ink">Sign out</div>
                  <div className="text-[11px] text-ink/55">End your session</div>
                </div>
              </button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
