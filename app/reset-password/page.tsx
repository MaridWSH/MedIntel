"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Icon from "@/components/ui/Icon";
import TopUtilityStrip from "@/components/site/TopUtilityStrip";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";

  const [token, setToken] = useState(tokenFromUrl);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (tokenFromUrl) {
      window.history.replaceState({}, "", "/reset-password");
    }
  }, [tokenFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 12) {
      setError("Password must be at least 12 characters.");
      return;
    }

    if (!token) {
      setError("Reset token is missing. Please use the link from your email.");
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => (window.location.href = "/login"), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-12">
      {/* LEFT: Form */}
      <div className="col-span-12 lg:col-span-7 fade-in d-2">
        <div className="mono-stat text-teal-deep mb-3">PHYSICIAN PORTAL</div>
        <h1 className="display text-[40px] md:text-[52px] tracking-tight mb-4">
          New password<span className="italic text-teal">.</span>
        </h1>
        <p className="serif-body text-[16px] text-ink-soft leading-[1.5] max-w-[440px] mb-9">
          Enter your new password below. Make it strong and unique.
        </p>

        {error && (
          <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px]">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 max-w-[480px]">
          {!tokenFromUrl && (
            <div>
              <label className="flex items-center justify-between mb-2" htmlFor="token">
                <span className="text-[11.5px] font-medium text-ink-soft">Reset token</span>
                <span className="text-[9.5px] mono-stat text-ink/40">FROM EMAIL</span>
              </label>
              <input
                type="text"
                id="token"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                required
                className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                placeholder="paste-token-here"
              />
            </div>
          )}

          <div>
            <label className="flex items-center justify-between mb-2" htmlFor="password">
              <span className="text-[11.5px] font-medium text-ink-soft">New password</span>
              <span className="text-[9.5px] mono-stat text-ink/40">MIN 12 CHARACTERS</span>
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={12}
              className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
              placeholder="••••••••••••"
            />
          </div>

          <div>
            <label className="flex items-center justify-between mb-2" htmlFor="confirmPassword">
              <span className="text-[11.5px] font-medium text-ink-soft">Confirm password</span>
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full h-12 rounded-[14px] bg-ink text-paper text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Resetting..."
            ) : (
              <>
                Reset password
                <Icon icon="lucide:arrow-right" className="text-[15px] text-teal-bright" />
              </>
            )}
          </button>
        </form>

        <p className="mt-8 text-[13px] text-ink-soft">
          Remember your password?{" "}
          <Link href="/login" className="text-teal-deep font-semibold hover:underline">
            Sign in
            <Icon icon="lucide:arrow-right" className="text-[13px] ml-1 inline" />
          </Link>
        </p>
      </div>

      {/* RIGHT: Info panel */}
      <aside className="col-span-12 lg:col-span-5 fade-in d-3">
        <div className="lg:sticky lg:top-[88px] space-y-5">
          <div className="rounded-2xl bg-paper-warm border border-ink/10 p-6">
            <div className="mono-stat text-ink/45 mb-4">PASSWORD TIPS</div>
            <div className="space-y-4">
              {[
                { icon: "lucide:shield-check", label: "Use at least 12 characters" },
                { icon: "lucide:shuffle", label: "Mix letters, numbers, and symbols" },
                { icon: "lucide:lock", label: "Avoid common words or personal info" },
                { icon: "lucide:refresh-cw", label: "Use a unique password for Claritas" },
              ].map(({ icon, label }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-teal-bright/10 border border-teal-bright/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon icon={icon} className="text-[15px] text-teal-deep" />
                  </div>
                  <span className="text-[13px] text-ink-soft leading-[1.5] pt-1">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-paper border border-ink/10 p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <Icon icon="lucide:shield-check" className="text-[16px] text-teal-deep" />
              <span className="text-[11.5px] font-semibold text-ink">Secure by design</span>
            </div>
            <p className="text-[11px] text-ink-soft leading-[1.5] mb-4">
              Passwords are hashed with bcrypt and never stored in plain text. Reset tokens expire in 15 minutes.
            </p>
            {/* Removed HIPAA / GDPR Art. 9 / ISO 27001 badges — we hold none of them. */}
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative min-h-[calc(100vh-68px-36px)] overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 55% 65% at 50% 30%, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.05) 40%, rgba(246,243,234,0) 70%)",
          }}
        />

        <div className="relative max-w-[1080px] mx-auto px-6 py-10 lg:py-14">
          <div className="fade-in flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[11.5px] text-ink/55">
              <Link href="/" className="hover:text-teal-deep">
                Claritas
              </Link>
              <Icon icon="lucide:chevron-right" className="text-[12px] text-ink/30" />
              <span className="text-teal-deep font-medium">Reset password</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10.5px] mono-stat text-ink/40">
              <Icon icon="lucide:lock" className="text-[11px]" />
              SINGLE-USE RESET TOKEN
            </div>
          </div>

          <Suspense fallback={<div className="text-center py-12 text-ink/40">Loading...</div>}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
