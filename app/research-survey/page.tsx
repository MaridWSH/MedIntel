'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import Icon from '../../components/ui/Icon';
import SiteFooter from '../../components/site/SiteFooter';
import SiteHeader from '../../components/site/SiteHeader';
import TopUtilityStrip from '../../components/site/TopUtilityStrip';
import { submitResearchSurvey } from '../../lib/api';

const ROLES = ['Physician', 'Resident or fellow', 'Medical student', 'Clinical researcher', 'Other'];
const EXPERIENCE = [
  'Less than 1 year',
  '1–5 years',
  '6–10 years',
  '11–20 years',
  'More than 20 years',
  'Not applicable',
];
const SOURCES = [
  'PubMed',
  'Google Scholar',
  'Clinical guidelines',
  'Journal websites',
  'Point-of-care tools',
  'Colleagues',
  'AI tools',
  'Other',
];
const PAPERS_NEEDED = ['1', '2–3', '4–5', '6–10', 'More than 10', 'It varies'];
const TIME_TASKS = [
  'Finding relevant papers',
  'Reading full papers',
  'Extracting key results',
  'Assessing study quality',
  'Comparing multiple papers',
  'Managing citations and notes',
  'Other',
];
const PROBLEMS = [
  'Too many irrelevant results',
  'Paywalls or unavailable full text',
  'Not enough time',
  'Difficulty assessing quality',
  'Complex statistics or terminology',
  'Conflicting findings',
  'Outdated information',
  'Other',
];

const inputClass =
  'w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-[14px] text-ink outline-none transition focus:border-teal-deep focus:ring-2 focus:ring-teal-deep/10';

function Question({
  number,
  title,
  hint,
  children,
}: {
  number: string;
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-start gap-4 mb-5">
        <span className="w-9 h-9 rounded-xl bg-ink text-paper inline-flex items-center justify-center text-[10px] mono-stat shrink-0">
          {number}
        </span>
        <div>
          <h2 className="text-[16px] md:text-[18px] font-semibold leading-snug">{title}</h2>
          {hint && <p className="text-[12.5px] text-ink-soft mt-1">{hint}</p>}
        </div>
      </div>
      {children}
    </fieldset>
  );
}

export default function ResearchSurveyPage() {
  const [role, setRole] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [experience, setExperience] = useState('');
  const [sources, setSources] = useState<string[]>([]);
  const [sourcesOther, setSourcesOther] = useState('');
  const [papersNeeded, setPapersNeeded] = useState('');
  const [timeTask, setTimeTask] = useState('');
  const [timeOther, setTimeOther] = useState('');
  const [problem, setProblem] = useState('');
  const [problemOther, setProblemOther] = useState('');
  const [trust, setTrust] = useState('');
  const [trustReason, setTrustReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleSource = (source: string) => {
    setSources((current) =>
      current.includes(source) ? current.filter((item) => item !== source) : [...current, source],
    );
  };

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (!role || !experience || sources.length === 0 || !papersNeeded || !timeTask || !problem || !trust) {
      setError('Please answer every required question before submitting.');
      return;
    }
    if (trustReason.trim().length < 10) {
      setError('Please briefly explain why you would or would not rely on the platform.');
      return;
    }

    const form = new FormData(event.currentTarget);
    setPending(true);
    try {
      await submitResearchSurvey({
        professional_role: role,
        specialty: specialty.trim(),
        years_experience: experience,
        sources,
        sources_other: sourcesOther.trim(),
        papers_needed: papersNeeded,
        most_time_consuming: timeTask,
        most_time_consuming_other: timeOther.trim(),
        biggest_problem: problem,
        biggest_problem_other: problemOther.trim(),
        trust_level: trust,
        trust_reason: trustReason.trim(),
        website: String(form.get('website') ?? ''),
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : 'Could not submit the survey.');
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
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_10%,rgba(20,184,166,0.14),transparent_42%)]" />
          <div className="max-w-[980px] mx-auto px-6 py-14 md:py-20 relative">
            <div className="text-[10.5px] mono-stat text-teal-deep mb-4">BETA RESEARCH · 3–5 MINUTES</div>
            <h1 className="display text-[40px] md:text-[62px] tracking-tight max-w-[820px]">
              How do you find and review <span className="italic text-teal">medical evidence?</span>
            </h1>
            <p className="serif-body text-[16px] md:text-[18px] text-ink-soft leading-relaxed mt-5 max-w-[720px]">
              Help us understand the real research workflow used by physicians and medical researchers.
              Responses are anonymous and will guide the Claritas beta.
            </p>
            <div className="flex items-start gap-2.5 mt-6 text-[12px] text-ink-soft">
              <Icon icon="lucide:shield-check" className="text-[16px] text-teal-deep mt-0.5" />
              <span>Do not include patient-identifiable, confidential, or clinical case information.</span>
            </div>
          </div>
        </section>

        <section className="max-w-[980px] mx-auto px-6 py-10 md:py-14">
          {submitted ? (
            <div className="rounded-3xl border border-teal-deep/20 bg-paper p-8 md:p-12 text-center shadow-sm">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-teal-deep text-white flex items-center justify-center">
                <Icon icon="lucide:check" className="text-[28px]" />
              </div>
              <h2 className="display text-[34px] mt-6">Thank you for sharing your workflow.</h2>
              <p className="text-ink-soft mt-3 max-w-[560px] mx-auto">
                Your response has been recorded and will help us prioritize the beta around real research needs.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-3 mt-7">
                <Link href="/search" className="btn-primary px-5 py-3 rounded-xl bg-ink text-paper">Explore Claritas</Link>
                <Link href="/feedback" className="px-5 py-3 rounded-xl border border-ink/15">Rate the website</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="rounded-2xl border border-ink/10 bg-paper p-5 md:p-7">
                <div className="grid md:grid-cols-3 gap-4">
                  <label className="text-[12px] font-semibold text-ink-soft">
                    Professional role <span className="text-red-700">*</span>
                    <select value={role} onChange={(e) => setRole(e.target.value)} className={`${inputClass} mt-2`} required>
                      <option value="">Select your role</option>
                      {ROLES.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                  <label className="text-[12px] font-semibold text-ink-soft">
                    Specialty <span className="font-normal text-ink/45">(optional)</span>
                    <input value={specialty} onChange={(e) => setSpecialty(e.target.value)} className={`${inputClass} mt-2`} maxLength={150} placeholder="e.g. Cardiology" />
                  </label>
                  <label className="text-[12px] font-semibold text-ink-soft">
                    Research experience <span className="text-red-700">*</span>
                    <select value={experience} onChange={(e) => setExperience(e.target.value)} className={`${inputClass} mt-2`} required>
                      <option value="">Select a range</option>
                      {EXPERIENCE.map((item) => <option key={item}>{item}</option>)}
                    </select>
                  </label>
                </div>
              </div>

              <Question number="01" title="What sources do you usually rely on when searching for medical research or references?" hint="Select all that apply.">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {SOURCES.map((source) => (
                    <label key={source} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${sources.includes(source) ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="checkbox" checked={sources.includes(source)} onChange={() => toggleSource(source)} className="w-4 h-4 accent-[var(--teal-deep)]" />
                      <span className="text-[13.5px]">{source}</span>
                    </label>
                  ))}
                </div>
                {sources.includes('Other') && <input value={sourcesOther} onChange={(e) => setSourcesOther(e.target.value)} className={`${inputClass} mt-3`} maxLength={500} placeholder="Please describe the other source" required />}
              </Question>

              <Question number="02" title="When looking for a specific answer, how many papers do you usually need to read before reaching it?">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {PAPERS_NEEDED.map((item) => (
                    <label key={item} className={`rounded-xl border px-4 py-3 text-center cursor-pointer transition ${papersNeeded === item ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="radio" name="papers-needed" value={item} checked={papersNeeded === item} onChange={() => setPapersNeeded(item)} className="sr-only" />
                      <span className="text-[13.5px] font-medium">{item}</span>
                    </label>
                  ))}
                </div>
              </Question>

              <Question number="03" title="Which part of reviewing research takes most of your time?">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {TIME_TASKS.map((item) => (
                    <label key={item} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${timeTask === item ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="radio" name="time-task" value={item} checked={timeTask === item} onChange={() => setTimeTask(item)} className="accent-[var(--teal-deep)]" />
                      <span className="text-[13.5px]">{item}</span>
                    </label>
                  ))}
                </div>
                {timeTask === 'Other' && <input value={timeOther} onChange={(e) => setTimeOther(e.target.value)} className={`${inputClass} mt-3`} maxLength={500} placeholder="Please describe the other task" required />}
              </Question>

              <Question number="04" title="What is the biggest problem you face when searching for medical research or references?">
                <div className="grid sm:grid-cols-2 gap-2.5">
                  {PROBLEMS.map((item) => (
                    <label key={item} className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition ${problem === item ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="radio" name="problem" value={item} checked={problem === item} onChange={() => setProblem(item)} className="accent-[var(--teal-deep)]" />
                      <span className="text-[13.5px]">{item}</span>
                    </label>
                  ))}
                </div>
                {problem === 'Other' && <input value={problemOther} onChange={(e) => setProblemOther(e.target.value)} className={`${inputClass} mt-3`} maxLength={500} placeholder="Please describe the other problem" required />}
              </Question>

              <Question number="05" title="If a platform provided an accurate summary with the key findings and essential points, would you rely on it? Why or why not?">
                <div className="grid grid-cols-3 gap-2.5 mb-4">
                  {['Yes', 'Maybe', 'No'].map((item) => (
                    <label key={item} className={`rounded-xl border px-4 py-3 text-center cursor-pointer transition ${trust === item ? 'border-teal-deep bg-teal-deep/[0.06]' : 'border-ink/10 hover:border-ink/25'}`}>
                      <input type="radio" name="trust" value={item} checked={trust === item} onChange={() => setTrust(item)} className="sr-only" />
                      <span className="text-[13.5px] font-semibold">{item}</span>
                    </label>
                  ))}
                </div>
                <label className="text-[12px] font-semibold text-ink-soft">
                  Your reasoning <span className="text-red-700">*</span>
                  <textarea value={trustReason} onChange={(e) => setTrustReason(e.target.value)} className={`${inputClass} mt-2 min-h-32 resize-y`} minLength={10} maxLength={2000} placeholder="What would make you trust it—or prevent you from trusting it?" required />
                </label>
              </Question>

              <label className="absolute -left-[10000px]" aria-hidden="true">
                Website
                <input name="website" tabIndex={-1} autoComplete="off" />
              </label>

              {error && <div role="alert" aria-live="polite" className="rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-[13px] text-red-800">{error}</div>}

              <div className="rounded-2xl bg-ink text-paper p-5 md:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
                <div>
                  <div className="font-semibold">Ready to submit?</div>
                  <p className="text-[12px] text-paper/60 mt-1">Anonymous response · No patient data · One submission takes about 3–5 minutes</p>
                </div>
                <button type="submit" disabled={pending} className="btn-primary min-w-40 rounded-xl bg-teal-bright text-ink px-6 py-3 font-semibold disabled:opacity-60 inline-flex items-center justify-center gap-2">
                  {pending ? <><Icon icon="lucide:loader-2" className="text-[17px] animate-spin" />Submitting…</> : <>Submit response<Icon icon="lucide:arrow-right" className="text-[16px]" /></>}
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
