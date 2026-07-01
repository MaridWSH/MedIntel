import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Sign in · Claritas',
  description: 'Sign in to your Claritas physician account.',
};

export default function LoginPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="relative min-h-[calc(100vh-68px-36px)] overflow-hidden">
        {/* Atmospheric */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(11,29,42,1) 1px, transparent 1px), linear-gradient(90deg, rgba(11,29,42,1) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
        <div
          className="absolute inset-x-0 top-0 h-[500px] pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse 55% 65% at 50% 30%, rgba(20,184,166,0.15) 0%, rgba(20,184,166,0.05) 40%, rgba(246,243,234,0) 70%)',
          }}
        />

        <div className="relative max-w-[1080px] mx-auto px-6 py-10 lg:py-14">
          {/* Breadcrumb */}
          <div className="fade-in flex items-center justify-between mb-8">
            <div className="flex items-center gap-2 text-[11.5px] text-ink/55">
              <Link href="/" className="hover:text-teal-deep">Claritas</Link>
              <Icon icon="lucide:chevron-right" className="text-[12px] text-ink/30" />
              <span className="text-teal-deep font-medium">Sign in</span>
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
                Welcome back<span className="italic text-teal">.</span>
              </h1>
              <p className="serif-body text-[16px] text-ink-soft leading-[1.5] max-w-[440px] mb-9">
                Sign in to access your synthesised papers, CME credits, and clinical appraisals.
              </p>

              <form className="space-y-5 max-w-[480px]">
                {/* Email */}
                <div>
                  <label className="flex items-center justify-between mb-2" htmlFor="email">
                    <span className="text-[11.5px] font-medium text-ink-soft">Email address</span>
                    <span className="text-[9.5px] mono-stat text-ink/40">INSTITUTIONAL OR PERSONAL</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                    placeholder="dr.name@hospital.org"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="flex items-center justify-between mb-2" htmlFor="password">
                    <span className="text-[11.5px] font-medium text-ink-soft">Password</span>
                    <Link href="#" className="text-[10.5px] mono-stat text-teal-deep hover:underline">
                      FORGOT PASSWORD?
                    </Link>
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="w-full h-12 px-4 rounded-xl bg-paper border border-ink/12 text-[14px] text-ink placeholder:text-ink/30 focus:border-teal-deep focus:shadow-[0_0_0_3px_rgba(13,148,136,0.12)] focus:outline-none transition-all duration-200"
                    placeholder="••••••••••••"
                  />
                </div>

                {/* Remember + SSO */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded accent-[var(--teal-deep)]" />
                    <span className="text-[12px] text-ink-soft">Remember me for 30 days</span>
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  className="btn-primary w-full h-12 rounded-[14px] bg-ink text-paper text-[14px] font-semibold flex items-center justify-center gap-2"
                >
                  Sign in
                  <Icon icon="lucide:arrow-right" className="text-[15px] text-teal-bright" />
                </button>

                {/* Divider */}
                <div className="flex items-center gap-4 py-2">
                  <div className="flex-1 h-px bg-ink/10" />
                  <span className="text-[10px] mono-stat text-ink/40">OR CONTINUE WITH</span>
                  <div className="flex-1 h-px bg-ink/10" />
                </div>

                {/* SSO */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-ink/15 bg-paper text-[12.5px] font-medium text-ink-soft flex items-center justify-center gap-2 hover-tint"
                  >
                    <Icon icon="lucide:building-2" className="text-[15px] text-ink/55" />
                    Institutional SSO
                  </button>
                  <button
                    type="button"
                    className="h-11 rounded-xl border border-ink/15 bg-paper text-[12.5px] font-medium text-ink-soft flex items-center justify-center gap-2 hover-tint"
                  >
                    <Icon icon="lucide:key-round" className="text-[15px] text-ink/55" />
                    ORCID Login
                  </button>
                </div>
              </form>

              {/* Register link */}
              <p className="mt-8 text-[13px] text-ink-soft">
                New to Claritas?{' '}
                <Link href="/register" className="text-teal-deep font-semibold hover:underline">
                  Create a physician account
                  <Icon icon="lucide:arrow-right" className="text-[13px] ml-1 inline" />
                </Link>
              </p>
            </div>

            {/* RIGHT: Trust panel */}
            <aside className="col-span-12 lg:col-span-5 fade-in d-3">
              <div className="lg:sticky lg:top-[88px] space-y-5">
                {/* Feature preview card */}
                <div className="rounded-2xl bg-paper-warm border border-ink/10 p-6">
                  <div className="mono-stat text-ink/45 mb-4">WHAT YOU GET</div>
                  <div className="space-y-4">
                    {[
                      { icon: 'lucide:zap', label: 'Six AI agents synthesise every paper in seconds' },
                      { icon: 'lucide:map', label: 'Interactive mind maps linking PICOT to source text' },
                      { icon: 'lucide:scale', label: 'GRADE-appraised quality scores on every study' },
                      { icon: 'lucide:graduation-cap', label: 'CME credits — 0.5 hrs per paper, ACCME accredited' },
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
                    <span className="text-[11.5px] font-semibold text-ink">Physician-only access</span>
                  </div>
                  <p className="text-[11px] text-ink-soft leading-[1.5] mb-4">
                    Every account is verified against national medical registries. Your data is encrypted at rest and never shared with third parties.
                  </p>
                  <div className="grid grid-cols-3 gap-2 text-[9.5px] mono-stat text-ink/45">
                    <div className="text-center">HIPAA<span className="block text-[8.5px] text-ink/35 mt-0.5">ALIGNED</span></div>
                    <div className="text-center">GDPR<span className="block text-[8.5px] text-ink/35 mt-0.5">ART. 9</span></div>
                    <div className="text-center">ISO 27001<span className="block text-[8.5px] text-ink/35 mt-0.5">IN PROGRESS</span></div>
                  </div>
                </div>

                {/* Testimonial */}
                <div className="rounded-2xl bg-ink text-paper p-5">
                  <p className="serif-body text-[14px] text-paper/85 leading-[1.55] mb-3">
                    &ldquo;Claritas cut my literature review time by 80%. The mind map alone is worth the subscription.&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-teal-deep flex items-center justify-center text-[11px] font-semibold">
                      KS
                    </div>
                    <div>
                      <div className="text-[11.5px] font-medium">Dr. K. El-Sherif</div>
                      <div className="text-[10px] text-paper/55">Cardiology · Ain Shams · 14 yrs</div>
                    </div>
                  </div>
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
