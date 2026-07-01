import type { Metadata } from 'next';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import SiteHeader from '../../components/site/SiteHeader';
import SiteFooter from '../../components/site/SiteFooter';

export const metadata: Metadata = {
  title: 'Account settings · Claritas',
  description: 'Manage your Claritas subscription, CME credits, and preferences.',
};

const NAV_ITEMS = [
  { icon: 'lucide:credit-card', label: 'Subscription & Billing', id: 'subscription', active: true },
  { icon: 'lucide:award', label: 'CME Credits', id: 'cme', badge: '14h' },
  { icon: 'lucide:sliders-horizontal', label: 'Preferences', id: 'preferences' },
  { icon: 'lucide:lock', label: 'Security & Privacy', id: 'security' },
  { icon: 'lucide:user', label: 'Account', id: 'account' },
];

export default function AccountPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />

      {/* Auto-save indicator */}
      <div className="border-b border-ink/10 bg-paper-warm/40">
        <div className="max-w-[1280px] mx-auto px-6 h-9 flex items-center justify-between text-[10.5px]">
          <div className="flex items-center gap-2 text-ink/55">
            <Link href="/" className="hover:text-teal-deep">Claritas</Link>
            <Icon icon="lucide:chevron-right" className="text-[11px] text-ink/30" />
            <span className="text-ink-soft">Account settings</span>
          </div>
          <span className="flex items-center gap-1.5 text-ink/45">
            <Icon icon="lucide:shield-check" className="text-[12px] text-teal" />
            SAVED TO CLARITAS CLOUD
          </span>
        </div>
      </div>

      <main className="relative max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
        {/* Page header */}
        <header className="mb-10 lg:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <div className="mono-stat text-teal-deep mb-4">§ SETTINGS</div>
            <h1 className="display text-[40px] md:text-[56px] tracking-tight">
              Account <span className="italic text-teal">settings</span>.
            </h1>
            <p className="serif-body text-[16px] text-ink-soft leading-[1.5] mt-3 max-w-[560px]">
              Manage your subscription, CME credits, language preferences and privacy controls. Changes save automatically.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 h-10 rounded-full bg-ink/[0.04] border border-ink/10 shrink-0">
            <div className="w-7 h-7 rounded-full bg-teal-deep/20 border border-teal-deep/40 flex items-center justify-center text-[10px] font-semibold text-teal-deep serif">
              KE
            </div>
            <div className="flex flex-col leading-none pr-2">
              <span className="text-[11.5px] font-semibold text-ink">K. El-Sherif, MD</span>
              <span className="text-[9px] mono-stat text-ink/50 mt-0.5">CARDIOLOGY · #EG-29384</span>
            </div>
          </div>
        </header>

        {/* Layout: Sidebar + Content */}
        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="col-span-12 md:col-span-3">
            <nav className="md:sticky md:top-[88px] flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
              <div className="text-[10px] mono-stat text-ink/40 mb-1 px-2 hidden md:block">SECTIONS</div>
              {NAV_ITEMS.map(({ icon, label, id, badge, active }) => (
                <a
                  key={id}
                  href={`#${id}`}
                  className={`flex items-center gap-2.5 px-3 h-10 rounded-md text-[13px] font-medium whitespace-nowrap transition-colors ${
                    active
                      ? 'bg-ink/[0.06] text-ink'
                      : 'text-ink-soft hover:bg-ink/[0.04]'
                  }`}
                >
                  <Icon icon={icon} className={`text-[15px] ${active ? '' : 'text-ink/50'}`} />
                  {label}
                  {badge && (
                    <span className="ml-auto px-1.5 h-5 rounded text-[9px] mono-stat bg-teal-deep/12 text-teal-deep inline-flex items-center">
                      {badge}
                    </span>
                  )}
                </a>
              ))}

              <div className="hidden md:block mt-6 pt-5 border-t border-ink/10 px-2">
                <div className="text-[10px] mono-stat text-ink/40 mb-3">SUPPORT</div>
                <Link href="#" className="flex items-center gap-2 text-[12px] text-ink-soft hover:text-teal-deep px-2 py-1.5 rounded-md">
                  <Icon icon="lucide:help-circle" className="text-[14px]" />
                  Talk to a physician
                </Link>
                <Link href="#" className="flex items-center gap-2 text-[12px] text-ink-soft hover:text-teal-deep px-2 py-1.5 rounded-md">
                  <Icon icon="lucide:book-open" className="text-[14px]" />
                  Documentation
                </Link>
              </div>
            </nav>
          </aside>

          {/* Main panel */}
          <section className="col-span-12 md:col-span-9 space-y-10">
            {/* Subscription & Billing */}
            <article id="subscription" className="scroll-mt-28">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="serif text-[24px] md:text-[28px] tracking-tight">Subscription & Billing</h2>
                <span className="text-[10px] mono-stat text-ink/40">01 / 05</span>
              </div>

              {/* Current Plan Card */}
              <div className="bg-ink text-paper rounded-2xl overflow-hidden">
                <div className="px-6 md:px-8 py-6 md:py-7 grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-7">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2 h-6 rounded-md bg-teal-bright text-ink text-[9.5px] mono-stat font-semibold inline-flex items-center">
                        CURRENT PLAN
                      </span>
                      <span className="text-[10px] mono-stat text-teal-bright">SINCE MARCH 2024</span>
                    </div>
                    <h3 className="serif text-[32px] md:text-[40px] tracking-tight text-paper leading-none">
                      Professional
                    </h3>
                    <p className="text-[13px] text-paper/70 leading-[1.5] mt-2.5 max-w-[420px]">
                      All six agents, unlimited full syntheses, saved paper library, email digests. Billed annually at $152/year.
                    </p>
                    <div className="flex items-end gap-1.5 mt-5">
                      <span className="serif text-[32px] leading-none tracking-tight text-paper">$152</span>
                      <span className="text-[12px] text-paper/55 mb-1.5">/ year</span>
                      <span className="text-[10px] mono-stat text-paper/40 mb-2 ml-3">≈ $12.67 / MONTH</span>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-5 md:border-l md:border-paper/15 md:pl-6 flex flex-col justify-between gap-4">
                    <div>
                      <div className="text-[10px] mono-stat text-paper/45 mb-2">NEXT BILLING DATE</div>
                      <div className="flex items-center gap-2">
                        <Icon icon="lucide:calendar" className="text-[14px] text-teal-bright" />
                        <span className="text-[14px] font-medium">15 March 2025</span>
                      </div>
                      <div className="text-[11px] text-paper/55 mt-1">Auto-renews via Visa •••• 4821</div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button className="btn-primary inline-flex items-center justify-center gap-1.5 px-3.5 h-9 bg-teal-bright text-ink text-[12px] font-semibold rounded-md">
                        Manage plan
                        <Icon icon="lucide:arrow-right" className="text-[13px]" />
                      </button>
                      <button className="inline-flex items-center justify-center px-3.5 h-9 border border-paper/25 text-paper/85 text-[12px] font-semibold rounded-md hover:bg-paper/10 transition-colors">
                        Cancel renewal
                      </button>
                    </div>
                  </div>
                </div>
                <div className="border-t border-paper/10 px-6 md:px-8 py-4 flex items-center justify-between text-[10.5px] mono-stat text-paper/55">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-teal-bright animate-pulse" />
                      ACTIVE · 287 SYNTHESSES THIS CYCLE
                    </span>
                  </div>
                  <span>RENEWS IN 47 DAYS</span>
                </div>
              </div>

              {/* Usage */}
              <div className="grid grid-cols-12 gap-px bg-ink/10 border border-ink/10 rounded-2xl overflow-hidden mt-5">
                <div className="col-span-12 md:col-span-7 bg-paper p-6 md:p-7">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[11px] mono-stat text-ink/55">USAGE · CURRENT CYCLE</h4>
                    <span className="text-[10px] mono-stat text-ink/40">RESETS 15 MAR</span>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    {[
                      { value: '287', suffix: '∞', label: 'FULL SYNTHESSES', note: 'Unlimited tier' },
                      { value: '14', suffix: 'h', label: 'CME CREDITS', note: '14h of 50h goal', suffixColor: 'text-teal' },
                      { value: '1,204', suffix: '', label: 'SAVED PAPERS', note: '47 collections' },
                    ].map(({ value, suffix, label, note, suffixColor }) => (
                      <div key={label}>
                        <div className="serif text-[28px] leading-none tracking-tight">
                          {value}
                          {suffix && <span className={`${suffixColor || 'text-ink/30'} text-[16px]`}>{suffix}</span>}
                        </div>
                        <div className="text-[9.5px] mono-stat text-ink/45 mt-1.5">{label}</div>
                        <div className="text-[11px] text-ink-soft mt-1">{note}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-12 md:col-span-5 bg-paper-warm p-6 md:p-7">
                  <div className="flex items-center gap-2 mb-3">
                    <Icon icon="lucide:arrow-up-circle" className="text-[15px] text-teal-deep" />
                    <h4 className="text-[13px] font-semibold text-ink">Considering Research Pro?</h4>
                  </div>
                  <p className="text-[12px] text-ink-soft leading-[1.5] mb-4">
                    Bulk export, systematic review builder, PRISMA flow diagrams and 5 collaborator seats.
                  </p>
                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="serif text-[24px] leading-none tracking-tight">$39</span>
                    <span className="text-[11px] text-ink/55">/ month</span>
                  </div>
                  <button className="btn-primary inline-flex items-center justify-center gap-1.5 px-3.5 h-9 bg-ink text-paper text-[12px] font-semibold rounded-md">
                    Upgrade plan
                    <Icon icon="lucide:arrow-right" className="text-[13px]" />
                  </button>
                </div>
              </div>
            </article>

            {/* CME Credits */}
            <article id="cme" className="scroll-mt-28">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="serif text-[24px] md:text-[28px] tracking-tight">CME Credits</h2>
                <span className="text-[10px] mono-stat text-ink/40">02 / 05</span>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
                <div className="grid grid-cols-12 gap-6">
                  <div className="col-span-12 md:col-span-5">
                    <div className="text-[10px] mono-stat text-ink/55 mb-3">CME PROGRESS · 2024</div>
                    <div className="flex items-end gap-2 mb-2">
                      <span className="serif text-[48px] leading-none tracking-tight">14</span>
                      <span className="text-[18px] text-ink/40 mb-1">/ 50 hours</span>
                    </div>
                    <div className="relative h-2 rounded-full bg-ink/8 overflow-hidden mb-3">
                      <div className="absolute inset-y-0 left-0 bg-teal-deep rounded-full" style={{ width: '28%' }} />
                    </div>
                    <p className="text-[12px] text-ink-soft leading-[1.5]">
                      Earn 0.5 CME credits per paper reviewed. ACCME and Arab Board accredited.
                    </p>
                  </div>
                  <div className="col-span-12 md:col-span-7">
                    <div className="text-[10px] mono-stat text-ink/55 mb-3">RECENT CME ACTIVITY</div>
                    <div className="space-y-3">
                      {[
                        { paper: 'Semaglutide & CV Outcomes', credits: 0.5, date: '2 days ago', specialty: 'Cardiology' },
                        { paper: 'SGLT2 Inhibitors in HFpEF', credits: 0.5, date: '1 week ago', specialty: 'Cardiology' },
                        { paper: 'Immunotherapy in NSCLC', credits: 0.5, date: '2 weeks ago', specialty: 'Oncology' },
                      ].map((item) => (
                        <div key={item.paper} className="flex items-center gap-3 p-3 rounded-xl bg-paper-warm/60 border border-ink/8">
                          <div className="w-9 h-9 rounded-lg bg-teal-deep/10 border border-teal-deep/20 flex items-center justify-center shrink-0">
                            <Icon icon="lucide:graduation-cap" className="text-[16px] text-teal-deep" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-[12.5px] font-medium text-ink truncate">{item.paper}</div>
                            <div className="text-[10.5px] text-ink/55">{item.specialty} · {item.date}</div>
                          </div>
                          <span className="mono-stat text-teal-deep shrink-0">+{item.credits}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </article>

            {/* Preferences */}
            <article id="preferences" className="scroll-mt-28">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="serif text-[24px] md:text-[28px] tracking-tight">Preferences</h2>
                <span className="text-[10px] mono-stat text-ink/40">03 / 05</span>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl divide-y divide-ink/8">
                {[
                  { label: 'Interface language', value: 'English', sub: 'Switch to العربية any time' },
                  { label: 'Search corpus', value: 'EN + AR', sub: 'English full-text and Arabic abstracts' },
                  { label: 'Weekly digest', value: 'On', sub: 'Every Monday at 08:00 GMT+2' },
                  { label: 'Paper format', value: 'AMA', sub: 'Citation style for exports' },
                ].map(({ label, value, sub }) => (
                  <div key={label} className="flex items-center justify-between px-6 py-4">
                    <div>
                      <div className="text-[13px] font-medium text-ink">{label}</div>
                      <div className="text-[11px] text-ink/55 mt-0.5">{sub}</div>
                    </div>
                    <span className="text-[12px] font-medium text-ink-soft px-3 h-8 rounded-lg bg-paper-warm border border-ink/10 flex items-center">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </article>

            {/* Security */}
            <article id="security" className="scroll-mt-28">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="serif text-[24px] md:text-[28px] tracking-tight">Security & Privacy</h2>
                <span className="text-[10px] mono-stat text-ink/40">04 / 05</span>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="space-y-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-ink">Two-factor authentication</div>
                      <div className="text-[11px] text-ink/55 mt-0.5">TOTP via authenticator app</div>
                    </div>
                    <span className="px-2.5 h-7 rounded-full bg-teal-deep/10 border border-teal-deep/25 text-teal-deep text-[10px] mono-stat font-semibold flex items-center">
                      ENABLED
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-ink">Session timeout</div>
                      <div className="text-[11px] text-ink/55 mt-0.5">Auto-logout after inactivity</div>
                    </div>
                    <span className="text-[12px] text-ink-soft">30 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[13px] font-medium text-ink">Data export</div>
                      <div className="text-[11px] text-ink/55 mt-0.5">Download all your data (GDPR Art. 20)</div>
                    </div>
                    <button className="text-[11px] text-teal-deep font-medium hover:underline flex items-center gap-1">
                      <Icon icon="lucide:download" className="text-[13px]" />
                      Request export
                    </button>
                  </div>
                </div>
              </div>
            </article>

            {/* Account */}
            <article id="account" className="scroll-mt-28">
              <div className="flex items-baseline justify-between mb-4">
                <h2 className="serif text-[24px] md:text-[28px] tracking-tight">Account</h2>
                <span className="text-[10px] mono-stat text-ink/40">05 / 05</span>
              </div>

              <div className="bg-paper border border-ink/12 rounded-2xl p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="text-[11px] font-medium text-ink-soft mb-2 block">Full name</label>
                    <input
                      type="text"
                      defaultValue="Dr. K. El-Sherif"
                      className="w-full h-11 px-4 rounded-xl bg-paper border border-ink/12 text-[13px] text-ink focus:border-teal-deep focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-ink-soft mb-2 block">Email</label>
                    <input
                      type="email"
                      defaultValue="k.elsherif@ainshams.edu.eg"
                      className="w-full h-11 px-4 rounded-xl bg-paper border border-ink/12 text-[13px] text-ink focus:border-teal-deep focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-ink-soft mb-2 block">Specialty</label>
                    <input
                      type="text"
                      defaultValue="Cardiology"
                      className="w-full h-11 px-4 rounded-xl bg-paper border border-ink/12 text-[13px] text-ink focus:border-teal-deep focus:outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-medium text-ink-soft mb-2 block">Institution</label>
                    <input
                      type="text"
                      defaultValue="Ain Shams University"
                      className="w-full h-11 px-4 rounded-xl bg-paper border border-ink/12 text-[13px] text-ink focus:border-teal-deep focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                {/* Danger zone */}
                <div className="mt-8 pt-6 border-t border-ink/8">
                  <div className="text-[10px] mono-stat text-ink/40 mb-3">DANGER ZONE</div>
                  <div className="flex flex-wrap items-center gap-3">
                    <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-ink/15 text-[12px] text-ink-soft font-medium hover-tint">
                      <Icon icon="lucide:log-out" className="text-[14px]" />
                      Sign out all devices
                    </button>
                    <button className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-lg border border-red-200 text-[12px] text-red-700 font-medium hover:bg-red-50 transition-colors">
                      <Icon icon="lucide:trash-2" className="text-[14px]" />
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
