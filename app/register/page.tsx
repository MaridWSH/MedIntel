"use client";

import Link from "next/link";
import { useState } from "react";
import Icon from "@/components/ui/Icon";
import TopUtilityStrip from "@/components/site/TopUtilityStrip";
import SiteHeader from "@/components/site/SiteHeader";
import SiteFooter from "@/components/site/SiteFooter";
import { registerUser } from "@/lib/api";

export default function RegisterPage() {
  // Form state matching API schema: {email, name, password}
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Generic handler for all text inputs
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  // Submit form to API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await registerUser(form);
      setSuccess("Account created! Redirecting...");
      setTimeout(() => (window.location.href = "/account"), 1200);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
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
          className="absolute inset-x-0 top-0 h-[560px] pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse 60% 70% at 50% 35%, rgba(20,184,166,0.18) 0%, rgba(20,184,166,0.06) 40%, rgba(246,243,234,0) 70%)",
          }}
        />

        <div className="relative max-w-[1080px] mx-auto px-6 py-10 lg:py-14">
          {/* Breadcrumb */}
          <div className="fade-in flex items-center justify-between mb-7">
            <div className="flex items-center gap-2 text-[11.5px] text-ink/55">
              <Link href="/" className="hover:text-teal-deep">
                Claritas
              </Link>
              <Icon icon="lucide:chevron-right" className="text-[12px] text-ink/30" />
              <span className="text-teal-deep font-medium">Sign up</span>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[10.5px] mono-stat text-ink/40">
              <Icon icon="lucide:lock" className="text-[11px]" />
              HTTPONLY SESSION COOKIES
            </div>
          </div>

          {/* Headline */}
          <div className="fade-in d-1 mb-9">
            <div className="mono-stat text-teal-deep mb-3">§ 01 · CREATE YOUR ACCOUNT</div>
            <h1 className="display text-[40px] md:text-[56px] tracking-tight max-w-[780px]">
              Join the free beta<span className="italic text-teal">.</span>
              <br />
              <span className="text-ink-soft">No credit card required.</span>
            </h1>
            <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.5] mt-4 max-w-[560px]">
              Create an account to save papers and explore every currently available pane.
              AI summaries are not clinician-reviewed and must be checked against the source.
            </p>
          </div>

          <div className="grid grid-cols-12 gap-8 lg:gap-10">
            {/* LEFT: Beta context */}
            <aside className="col-span-12 lg:col-span-4 fade-in d-2">
              <div className="lg:sticky lg:top-[88px]">
                <div className="text-[10.5px] mono-stat text-teal-deep mb-4">BETA ACCESS</div>
                <div className="rounded-2xl bg-paper-warm border border-ink/10 p-5">
                  <h2 className="serif text-[22px] tracking-tight mb-3">One short form.</h2>
                  <ul className="space-y-3 text-[12.5px] text-ink-soft">
                    {[
                      'No payment details or licence documents',
                      'Save papers to your personal library',
                      'Access all currently available evidence panes',
                    ].map((item) => (
                      <li key={item} className="flex items-start gap-2">
                        <Icon icon="lucide:check" className="text-[14px] text-teal-deep mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Trust card */}
                <div className="mt-7 p-4 rounded-2xl bg-paper-warm/60 border border-ink/10">
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <Icon icon="lucide:shield-check" className="text-[16px] text-teal-deep" />
                  <div className="text-[11.5px] font-semibold text-ink">Security note</div>
                  </div>
                  {/* "Hashed with AES-256" is not a thing, and we hold no HIPAA/GDPR/ISO certification. */}
                  <p className="text-[11.5px] text-ink-soft leading-[1.5]">
                    Passwords are hashed with Argon2 and browser sessions use HttpOnly cookies.
                    Production deployment requires HTTPS. We hold no compliance certification &mdash;
                    please do not put patient data here.
                  </p>
                </div>

                <Link
                  href="/login"
                  className="mt-5 flex items-center gap-2 text-[11.5px] text-ink-soft hover:text-teal-deep"
                >
                  <Icon icon="lucide:log-in" className="text-[14px] text-teal" />
                  Already have an account? Sign in instead.
                </Link>
              </div>
            </aside>

            {/* RIGHT: Registration form */}
            <div className="col-span-12 lg:col-span-8 fade-in d-3">
              <div className="bg-paper border border-ink/12 rounded-3xl p-6 md:p-8 shadow-[0_24px_60px_-30px_rgba(11,29,42,0.18)]">
                <h2 className="serif text-[26px] md:text-[30px] tracking-tight leading-tight mb-2">
                  Create your credentials
                </h2>
                <p className="text-[14px] text-ink-soft leading-[1.5] mb-8 max-w-[480px]">
                  Use an email you can access for account recovery. Do not enter patient data anywhere
                  in this beta product.
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

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Name field — maps to API "name" */}
                  <div>
                    <label className="flex items-center justify-between mb-2" htmlFor="name">
                      <span className="text-[11.5px] font-medium text-ink-soft">Full name</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                      placeholder="e.g., Dr. Amelia El-Sherif"
                    />
                  </div>

                  {/* Email field */}
                  <div>
                    <label className="flex items-center justify-between mb-2" htmlFor="email">
                      <span className="text-[11.5px] font-medium text-ink-soft">Email address</span>
                      <span className="text-[9.5px] mono-stat text-ink/40">ACCOUNT LOGIN</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                      placeholder="dr.name@hospital.org"
                    />
                  </div>

                  {/* Password field */}
                  <div>
                    <label className="flex items-center justify-between mb-2" htmlFor="password">
                      <span className="text-[11.5px] font-medium text-ink-soft">Password</span>
                      <span className="text-[9.5px] mono-stat text-ink/40">MIN 12 CHARACTERS</span>
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      minLength={12}
                      className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                      placeholder="••••••••••••"
                    />
                  </div>

                  {/* Consent checkboxes */}
                  <div className="pt-2 space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        required
                        className="mt-1 w-4 h-4 rounded accent-[var(--teal-deep)] shrink-0"
                      />
                      <span className="text-[12px] text-ink-soft leading-[1.55]">
                        I agree to the{" "}
                        <Link href="/terms" className="text-teal-deep hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-teal-deep hover:underline">
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>

                  {/* Form footer with submit button */}
                  <div className="pt-5 mt-2 border-t border-ink/8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/45">
                      <Icon icon="lucide:info" className="text-[12px]" />
                      FREE BETA · NO CARD REQUIRED
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-1.5 h-12 px-4 rounded-[14px] border border-ink/15 text-ink text-[13.5px] font-medium hover-tint"
                      >
                        <Icon icon="lucide:arrow-left" className="text-[14px]" />
                        Sign in
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        className="btn-primary flex-1 md:flex-none inline-flex items-center justify-center gap-2 h-12 md:px-8 px-5 rounded-[14px] bg-ink text-paper text-[14px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          "Creating..."
                        ) : (
                          <>
                            Create account
                            <Icon icon="lucide:arrow-right" className="text-[15px] text-teal-bright" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </form>
              </div>

              {/* SSO alternative */}
              <div className="mt-6 p-5 rounded-2xl bg-paper-warm/60 border border-ink/10">
                <div className="flex items-center gap-4 mb-3">
                  <span className="text-[10px] mono-stat text-ink/40">OR SIGN UP WITH</span>
                  <div className="flex-1 h-px bg-ink/8" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-ink/15 bg-paper text-[12.5px] font-medium text-ink-soft flex items-center justify-center gap-2 hover-tint"
                  >
                    <Icon icon="lucide:building-2" className="text-[15px] text-ink/55" />
                    Institutional SSO (SAML)
                  </button>
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-ink/15 bg-paper text-[12.5px] font-medium text-ink-soft flex items-center justify-center gap-2 hover-tint"
                  >
                    <Icon icon="lucide:key-round" className="text-[15px] text-ink/55" />
                    ORCID iD
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
