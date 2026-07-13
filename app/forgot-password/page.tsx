"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import TopUtilityStrip from "@/components/site/TopUtilityStrip";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await forgotPassword(email);
      setSuccess("Check your email for a password reset link.");
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative min-h-[calc(100vh-68px-36px)] overflow-hidden">
        {/* Background grid */}
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
          {/* Breadcrumb */}
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
              ENCRYPTED · TLS 1.3
            </div>
          </div>

          <div className="grid grid-cols-12 gap-8 lg:gap-12">
            {/* LEFT: Form */}
            <div className="col-span-12 lg:col-span-7 fade-in d-2">
              <div className="mono-stat text-teal-deep mb-3">PHYSICIAN PORTAL</div>
              <h1 className="display text-[40px] md:text-[52px] tracking-tight mb-4">
                Forgot password<span className="italic text-teal">?</span>
              </h1>
              <p className="serif-body text-[16px] text-ink-soft leading-[1.5] max-w-[440px] mb-9">
                Enter your email and we will send you a link to reset your password. The link expires in 15 minutes.
              </p>

              {/* Error message */}
              {error && (
                <div className="mb-5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-[13px]">
                  {error}
                </div>
              )}

              {/* Success message */}
              {success && (
                <div className="mb-5 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-[13px]">
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5 max-w-[480px]">
                {/* Email */}
                <div>
                  <label className="flex items-center justify-between mb-2" htmlFor="email">
                    <span className="text-[11.5px] font-medium text-ink-soft">Email address</span>
                    <span className="text-[9.5px] mono-stat text-ink/40">REGISTERED EMAIL</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                    placeholder="dr.name@hospital.org"
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full h-12 rounded-[14px] bg-ink text-paper text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    "Sending..."
                  ) : (
                    <>
                      Send reset link
                      <Icon icon="lucide:arrow-right" className="text-[15px] text-teal-bright" />
                    </>
                  )}
                </button>
              </form>

              {/* Back to login */}
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
                {/* Security note */}
                <div className="rounded-2xl bg-paper-warm border border-ink/10 p-6">
                  <div className="mono-stat text-ink/45 mb-4">SECURITY NOTES</div>
                  <div className="space-y-4">
                    {[
                      {
                        icon: "lucide:clock",
                        label: "Reset links expire in 15 minutes",
                      },
                      {
                        icon: "lucide:mail",
                        label: "Check spam folder if not received",
                      },
                      {
                        icon: "lucide:shield",
                        label: "Never share reset links with anyone",
                      },
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

                {/* Trust badges */}
                <div className="rounded-2xl bg-paper border border-ink/10 p-5">
                  <div className="flex items-center gap-2.5 mb-3">
                    <Icon icon="lucide:shield-check" className="text-[16px] text-teal-deep" />
                    <span className="text-[11.5px] font-semibold text-ink">Account security</span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-[1.5] mb-3">
                    Passwords are hashed with Argon2 and never stored in plain text, and the site is
                    served over TLS. We are a closed beta: we hold no compliance certification, so
                    don&rsquo;t put patient data here.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}