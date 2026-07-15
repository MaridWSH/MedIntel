"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Icon from "@/components/ui/Icon";
import TopUtilityStrip from "@/components/site/TopUtilityStrip";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { fetchCurrentUser, getDashboardStats, listSavedPapers, unsavePaper } from "@/lib/api";

interface User {
  id: number;
  email: string;
  name: string;
  created_at: string;
}

interface DashboardStats {
  saved_papers: number;
  total_papers_available: number;
  member_since: string;
}

interface SavedPaper {
  paper_id: string;
  saved_at: string;
  title: string;
  tldr: string;
  study_type: string;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [savedPapers, setSavedPapers] = useState<SavedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "saved">("overview");

  useEffect(() => {
    Promise.all([
      fetchCurrentUser(),
      getDashboardStats(),
      listSavedPapers(),
    ])
      .then(([userData, statsData, savedData]) => {
        if (userData) {
          setUser(userData);
          setStats(statsData);
          setSavedPapers(savedData.items || []);
        } else {
          window.location.href = "/login";
        }
      })
      .catch(() => {
        window.location.href = "/login";
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (paperId: string) => {
    try {
      await unsavePaper(paperId);
      setSavedPapers((prev) => prev.filter((p) => p.paper_id !== paperId));
      setStats((prev) => prev ? { ...prev, saved_papers: prev.saved_papers - 1 } : null);
    } catch (err) {
      console.error("Failed to unsave paper:", err);
    }
  };

  if (loading) {
    return (
      <>
        <TopUtilityStrip />
        <SiteHeader />
        <main className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-ink/15 border-t-teal rounded-full animate-spin" />
            <p className="text-[13px] text-ink/50 mono-stat">Loading dashboard...</p>
          </div>
        </main>
      </>
    );
  }

  if (!user || !stats) {
    return null;
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />

      <main className="relative max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
        {/* Header */}
        <header className="mb-8">
          <div className="mono-stat text-teal-deep mb-3">§ DASHBOARD</div>
          <h1 className="display text-[40px] md:text-[56px] tracking-tight">
            Welcome back, {user.name.split(" ")[0]}<span className="italic text-teal">.</span>
          </h1>
          <p className="serif-body text-[16px] text-ink-soft leading-[1.5] mt-2">
            Track your saved papers, explore the evidence library, and manage your account.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-ink/10">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-teal-deep text-teal-deep"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            <Icon icon="lucide:layout-dashboard" className="text-[15px] inline mr-2" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-3 text-[13px] font-medium border-b-2 transition-colors ${
              activeTab === "saved"
                ? "border-teal-deep text-teal-deep"
                : "border-transparent text-ink-soft hover:text-ink"
            }`}
          >
            <Icon icon="lucide:bookmark" className="text-[15px] inline mr-2" />
            Saved Papers
            {savedPapers.length > 0 && (
              <span className="ml-2 px-2 h-5 rounded-full bg-teal-deep/10 text-teal-deep text-[10px] mono-stat">
                {savedPapers.length}
              </span>
            )}
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                    <Icon icon="lucide:bookmark" className="text-[18px] text-teal-deep" />
                  </div>
                  <div>
                    <div className="text-[10px] mono-stat text-ink/45">SAVED PAPERS</div>
                    <div className="serif text-[28px] leading-none tracking-tight mt-1">{stats.saved_papers}</div>
                  </div>
                </div>
                <p className="text-[11px] text-ink-soft">Papers in your personal library</p>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                    <Icon icon="lucide:database" className="text-[18px] text-teal-deep" />
                  </div>
                  <div>
                    <div className="text-[10px] mono-stat text-ink/45">AVAILABLE PAPERS</div>
                    <div className="serif text-[28px] leading-none tracking-tight mt-1">{stats.total_papers_available.toLocaleString()}</div>
                  </div>
                </div>
                <p className="text-[11px] text-ink-soft">Papers in the evidence library</p>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                    <Icon icon="lucide:calendar" className="text-[18px] text-teal-deep" />
                  </div>
                  <div>
                    <div className="text-[10px] mono-stat text-ink/45">MEMBER SINCE</div>
                    <div className="text-[16px] font-medium mt-1">{new Date(stats.member_since).toLocaleDateString()}</div>
                  </div>
                </div>
                <p className="text-[11px] text-ink-soft">Your account creation date</p>
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
                <Link
                  href="/account"
                  className="flex items-center gap-3 p-4 rounded-xl bg-paper-warm border border-ink/10 hover:border-teal-deep/30 hover:bg-paper transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center">
                    <Icon icon="lucide:settings" className="text-[18px] text-teal-deep" />
                  </div>
                  <div>
                    <div className="text-[13px] font-medium text-ink">Account settings</div>
                    <div className="text-[11px] text-ink/55">Manage your profile</div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Recent saved papers preview */}
            {savedPapers.length > 0 && (
              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-[11px] mono-stat text-ink/45">RECENTLY SAVED</h3>
                  <button
                    onClick={() => setActiveTab("saved")}
                    className="text-[11px] text-teal-deep font-medium hover:underline"
                  >
                    View all →
                  </button>
                </div>
                <div className="space-y-2">
                  {savedPapers.slice(0, 3).map((paper) => (
                    <div
                      key={paper.paper_id}
                      className="flex items-center justify-between p-3 rounded-xl bg-paper-warm/60 border border-ink/8"
                    >
                      <Link href={`/paper/${paper.paper_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center shrink-0">
                          <Icon icon="lucide:file-text" className="text-[14px] text-teal-deep" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[12px] font-medium text-ink truncate">
                            {paper.title || paper.paper_id}
                          </div>
                          <div className="text-[10px] text-ink/55">Saved {new Date(paper.saved_at).toLocaleDateString()}</div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleUnsave(paper.paper_id)}
                        className="text-ink/40 hover:text-red-600 transition-colors shrink-0 ml-2"
                        title="Remove from saved"
                      >
                        <Icon icon="lucide:x" className="text-[14px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Saved Papers Tab */}
        {activeTab === "saved" && (
          <div className="bg-paper border border-ink/12 rounded-2xl p-6">
            {savedPapers.length === 0 ? (
              <div className="text-center py-12">
                <Icon icon="lucide:bookmark" className="text-[48px] text-ink/15 mx-auto mb-4" />
                <p className="text-[16px] font-medium text-ink mb-2">No saved papers yet</p>
                <p className="text-[13px] text-ink-soft mb-4">
                  Start saving papers from the evidence library to build your personal collection.
                </p>
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-4 h-10 rounded-lg bg-ink text-paper text-[13px] font-semibold btn-primary"
                >
                  <Icon icon="lucide:search" className="text-[15px]" />
                  Browse papers
                </Link>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="serif text-[20px] tracking-tight">
                    Your saved papers<span className="italic text-teal">.</span>
                  </h3>
                  <span className="text-[10px] mono-stat text-ink/45">{savedPapers.length} papers</span>
                </div>
                <div className="space-y-2">
                  {savedPapers.map((paper) => (
                    <div
                      key={paper.paper_id}
                      className="flex items-center justify-between p-4 rounded-xl bg-paper-warm/60 border border-ink/8 hover:border-teal-deep/20 transition-colors"
                    >
                      <Link href={`/paper/${paper.paper_id}`} className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center shrink-0">
                          <Icon icon="lucide:file-text" className="text-[16px] text-teal-deep" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[13px] font-medium text-ink truncate">
                            {paper.title || paper.paper_id}
                          </div>
                          <div className="text-[11px] text-ink/55">Saved {new Date(paper.saved_at).toLocaleDateString()}</div>
                        </div>
                      </Link>
                      <button
                        onClick={() => handleUnsave(paper.paper_id)}
                        className="text-ink/40 hover:text-red-600 transition-colors shrink-0 ml-3"
                        title="Remove from saved"
                      >
                        <Icon icon="lucide:trash-2" className="text-[15px]" />
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
