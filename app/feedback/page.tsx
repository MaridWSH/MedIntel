'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import SiteFooter from '../../components/site/SiteFooter';
import SiteHeader from '../../components/site/SiteHeader';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import { submitProductFeedback } from '../../lib/api';

const FEATURES = [
  'Search and discovery',
  'AI summaries',
  'Key findings',
  'Concept maps',
  'Full paper view',
  'Saved papers',
  'Citation export',
];

const inputClass =
  'w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-[14px] text-ink outline-none transition focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/10';

function RatingField({
  label,
  value,
  onChange,
  optional = false,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  optional?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-ink/10 bg-paper p-5">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[13.5px] font-semibold">{label}</div>
        {optional && value === 0 && <span className="text-[10px] mono-stat text-ink/40">NOT USED</span>}
      </div>
      <div className="grid grid-cols-5 gap-2 mt-4" role="radiogroup" aria-label={label}>
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            role="radio"
            aria-checked={value === rating}
            onClick={() => onChange(rating)}
            className={`rounded-xl border py-2.5 text-[13px] font-semibold transition ${value === rating ? 'border-teal-deep bg-teal-deep text-white' : 'border-ink/10 hover:border-teal-deep/50'}`}
          >
            {rating}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] text-ink/45 mt-2"><span>Poor</span><span>Excellent</span></div>
      {optional && value > 0 && <button type="button" onClick={() => onChange(0)} className="text-[11px] text-ink-soft underline mt-2">I did not use this</button>}
    </div>
  );
}

export default function ProductFeedbackPage() {
  const [overall, setOverall] = useState(0);
  const [ease, setEase] = useState(0);
  const [searchRating, setSearchRating] = useState(0);
  const [summaryRating, setSummaryRating] = useState(0);
  const [features, setFeatures] = useState<string[]>([]);
  const [mostUseful, setMostUseful] = useState('');
  const [problems, setProblems] = useState('');
  const [improvements, setImprovements] = useState('');
  const [featureRequests, setFeatureRequests] = useState('');
  const [recommend, setRecommend] = useState('');
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleFeature = (feature: string) => {
    setFeatures((current) =>
      current.includes(feature) ? current.filter((item) => item !== feature) : [...current, feature],
    );
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!overall || !ease || !recommend) {
      setError('Please provide the overall rating, ease-of-use rating, and recommendation answer.');
      return;
    }
    if (![mostUseful, problems, improvements, featureRequests].some((value) => value.trim())) {
      setError('Please add at least one written comment so we know what to improve.');
      return;
    }

    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await submitProductFeedback({
        overall_rating: overall,
        ease_of_use_rating: ease,
        search_rating: searchRating || null,
        summary_rating: summaryRating || null,
        features_used: features,
        most_useful: mostUseful.trim(),
        problems_encountered: problems.trim(),
        improvements: improvements.trim(),
        feature_requests: featureRequests.trim(),
        would_recommend: recommend,
        contact_email: email.trim() || null,
        website: String(form.get('website') ?? ''),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not submit your feedback.');
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="min-h-screen bg-paper-warm/35">
        <section className="relative overflow-hidden border-b border-ink/10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_0%,rgba(20,184,166,0.15),transparent_42%)]" />
          <div className="max-w-[980px] mx-auto px-6 py-14 md:py-20 relative">
            <div className="text-[10.5px] mono-stat text-teal-deep mb-4">CLARITAS CLOSED BETA · 4–6 MINUTES</div>
            <h1 className="display text-[40px] md:text-[62px] tracking-tight max-w-[820px]">
              Help us decide what to <span className="italic text-teal">improve next.</span>
            </h1>
            <p className="serif-body text-[16px] md:text-[18px] text-ink-soft leading-relaxed mt-5 max-w-[720px]">
              Rate your experience, report anything that did not work, and tell us which features would make Claritas more useful.
            </p>
            <div className="flex items-start gap-2.5 mt-6 text-[12px] text-ink-soft">
              <Icon icon="lucide:shield-check" className="text-[16px] text-teal-deep mt-0.5" />
              <span>Do not include patient-identifiable information or confidential research material.</span>
            </div>
          </div>
        </section>

        <section className="max-w-[980px] mx-auto px-6 py-10 md:py-14">
          {submitted ? (
            <div className="rounded-3xl border border-teal-deep/20 bg-paper p-8 md:p-12 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-deep text-white flex items-center justify-center"><Icon icon="lucide:check" className="text-[28px]" /></div>
              <h2 className="display text-[34px] mt-6">Thank you for helping shape Claritas.</h2>
              <p className="text-ink-soft mt-3 max-w-[560px] mx-auto">Your feedback has been recorded and will be reviewed during beta planning.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
                <Link href="/search" className="btn-primary px-5 py-3 rounded-xl bg-ink text-paper">Return to search</Link>
                <Link href="/research-survey" className="px-5 py-3 rounded-xl border border-ink/15">Share your research workflow</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <section className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-ink text-paper inline-flex items-center justify-center text-[10px] mono-stat shrink-0">01</span>
                  <div><h2 className="text-[18px] font-semibold">Rate your experience</h2><p className="text-[12.5px] text-ink-soft mt-1">1 is poor and 5 is excellent. Search and summary ratings are optional.</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-3">
                  <RatingField label="Overall experience *" value={overall} onChange={setOverall} />
                  <RatingField label="Ease of use *" value={ease} onChange={setEase} />
                  <RatingField label="Search quality" value={searchRating} onChange={setSearchRating} optional />
                  <RatingField label="Summary usefulness" value={summaryRating} onChange={setSummaryRating} optional />
                </div>
              </section>

              <section className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-ink text-paper inline-flex items-center justify-center text-[10px] mono-stat shrink-0">02</span>
                  <div><h2 className="text-[18px] font-semibold">Which features did you use?</h2><p className="text-[12.5px] text-ink-soft mt-1">Select all that apply.</p></div>
                </div>
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {FEATURES.map((feature) => (
                    <label key={feature} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${features.includes(feature) ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="checkbox" checked={features.includes(feature)} onChange={() => toggleFeature(feature)} className="w-4 h-4 accent-[var(--teal-deep)]" />
                      <span className="text-[13.5px]">{feature}</span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-ink text-paper inline-flex items-center justify-center text-[10px] mono-stat shrink-0">03</span>
                  <div><h2 className="text-[18px] font-semibold">Tell us what worked—and what did not</h2><p className="text-[12.5px] text-ink-soft mt-1">At least one written response is required.</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className="text-[12px] font-semibold text-ink-soft">What was most useful?<textarea value={mostUseful} onChange={(e) => setMostUseful(e.target.value)} maxLength={1500} className={`${inputClass} mt-2 min-h-28 resize-y`} placeholder="What saved time or helped you understand a paper?" /></label>
                  <label className="text-[12px] font-semibold text-ink-soft">What problems did you encounter?<textarea value={problems} onChange={(e) => setProblems(e.target.value)} maxLength={3000} className={`${inputClass} mt-2 min-h-28 resize-y`} placeholder="Broken behavior, confusing screens, inaccurate output, mobile issues…" /></label>
                  <label className="text-[12px] font-semibold text-ink-soft">What should we improve?<textarea value={improvements} onChange={(e) => setImprovements(e.target.value)} maxLength={3000} className={`${inputClass} mt-2 min-h-28 resize-y`} placeholder="What would make the current experience better?" /></label>
                  <label className="text-[12px] font-semibold text-ink-soft">Which features should we add?<textarea value={featureRequests} onChange={(e) => setFeatureRequests(e.target.value)} maxLength={3000} className={`${inputClass} mt-2 min-h-28 resize-y`} placeholder="Comparison tools, exports, alerts, collaboration, new filters…" /></label>
                </div>
              </section>

              <section className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
                <div className="flex items-start gap-4 mb-5">
                  <span className="w-9 h-9 rounded-xl bg-ink text-paper inline-flex items-center justify-center text-[10px] mono-stat shrink-0">04</span>
                  <div><h2 className="text-[18px] font-semibold">One last question</h2><p className="text-[12.5px] text-ink-soft mt-1">Would you recommend this beta to a colleague?</p></div>
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {['Yes', 'Maybe', 'No'].map((item) => (
                    <label key={item} className={`rounded-xl border px-4 py-3 text-center cursor-pointer transition ${recommend === item ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="radio" name="recommend" value={item} checked={recommend === item} onChange={() => setRecommend(item)} className="sr-only" />
                      <span className="text-[13.5px] font-semibold">{item}</span>
                    </label>
                  ))}
                </div>
                <label className="block text-[12px] font-semibold text-ink-soft mt-5">
                  Contact email <span className="font-normal text-ink/45">(optional, only if you are happy for us to follow up)</span>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={255} className={`${inputClass} mt-2`} placeholder="you@example.com" />
                </label>
              </section>

              <label className="absolute -left-[10000px]" aria-hidden="true">Website<input name="website" tabIndex={-1} autoComplete="off" /></label>
              {error && <div role="alert" aria-live="polite" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</div>}

              <div className="rounded-2xl bg-ink text-paper p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div><div className="font-semibold">Send your beta feedback</div><p className="text-[12px] text-paper/60 mt-1">Optional email · No patient data · Reviewed for product planning</p></div>
                <button type="submit" disabled={pending} className="btn-primary min-w-40 rounded-xl bg-teal-bright text-ink px-6 py-3 font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  {pending ? <><Icon icon="lucide:loader-2" className="text-[17px] animate-spin" />Submitting…</> : <>Submit feedback<Icon icon="lucide:arrow-right" className="text-[16px]" /></>}
                </button>
              </div>
            </form>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
