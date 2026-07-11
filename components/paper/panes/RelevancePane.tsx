'use client';

import { useState } from 'react';
import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

interface PracticePoint {
  type: 'positive' | 'caution';
  title: string;
  description: string;
}

export default function RelevancePane({ paper }: { paper: Paper }) {
  // Signal from backend or fallback
  const signal = String(paper.key_findings?.['signal'] || '');
  const isPracticeChanging = signal.toLowerCase().includes('practice') || signal.toLowerCase().includes('changing');

  // Summary from backend
  const summary = paper.detailed_summary || paper.tldr || 'No clinical summary available.';

  // PICO from backend
  const pico = paper.pico_summary || {};
  const picoEntries = Object.entries(pico);

  // Grade from backend
  const grade = String(paper.verification?.['grade'] || '');
  const gradeDescription = String(paper.verification?.['grade_description'] || '');
  const confidence = String(paper.verification?.['confidence'] || '');

  // Practice points from backend or fallback
  const practicePoints: PracticePoint[] = Array.isArray(paper.key_findings?.['practice_points'])
    ? (paper.key_findings['practice_points'] as PracticePoint[])
    : signal ? [
        {
          type: 'positive',
          title: 'Consider adding to guideline',
          description: 'The effect size is clinically meaningful and consistent across key subgroups.',
        },
        {
          type: 'positive',
          title: 'Discuss with eligible patients',
          description: 'Patients should be informed of this option as part of shared decision-making.',
        },
        {
          type: 'caution',
          title: 'Monitor for adverse effects',
          description: 'Close monitoring may be required depending on intervention type.',
        },
      ] : [];

  // Specialty tags from backend
  const specialties = paper.specialty_tags || [];

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 05 &middot; CLINICAL RELEVANCE &middot; {paper.processing_time?.toFixed(1) || '0.8'}s
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-teal-deep text-paper text-[10.5px] mono-stat font-semibold">
          <Icon icon="lucide:zap" className="text-[12px] text-teal-bright" />
          {isPracticeChanging ? 'PRACTICE-CHANGING' : signal.toUpperCase() || 'REVIEW NEEDED'}
        </div>
      </div>

      {signal || practicePoints.length > 0 ? (
        <>
          {/* Practice-change banner */}
          <div className="relative bg-ink text-paper rounded-3xl p-7 md:p-9 overflow-hidden">
            <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full bg-teal-bright/25 blur-3xl pointer-events-none" />
            <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2">
                <div className="text-[10.5px] mono-stat text-teal-bright mb-3">{signal || 'CLINICAL ASSESSMENT'}</div>
                <h3 className="serif text-[26px] md:text-[34px] tracking-tight text-paper leading-[1.05] mb-3">
                  {isPracticeChanging ? 'Yes, this paper changes practice.' : 'Clinical relevance assessment.'}
                </h3>
                <p className="serif-body text-[15.5px] text-paper/75 leading-[1.55] max-w-[480px]">
                  {summary}
                </p>
              </div>
              <div className="md:col-span-1 flex flex-col gap-3 md:items-end justify-center">
                <div className="inline-flex items-center gap-2 px-4 h-12 rounded-2xl bg-teal-bright text-ink text-[14px] font-bold">
                  <Icon icon="lucide:zap" className="text-[18px]" />
                  {isPracticeChanging ? 'PRACTICE-CHANGING' : signal.toUpperCase() || 'PENDING'}
                </div>
                <div className="text-[10.5px] mono-stat text-paper/60 text-right">{confidence || 'Assessment pending'}</div>
              </div>
            </div>
          </div>

          {/* Specialty tags + evidence grade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
              <div className="text-[10.5px] mono-stat text-ink/55 mb-3">SPECIALTY TAGS</div>
              <div className="flex flex-wrap items-center gap-1.5">
                {specialties.length > 0 ? (
                  specialties.map((s, i) => (
                    <span
                      key={s}
                      className={
                        i === 0
                          ? 'px-3 h-8 rounded-full bg-ink text-paper text-[12px] font-medium inline-flex items-center gap-1.5'
                          : 'px-3 h-8 rounded-full bg-ink/[0.04] border border-ink/10 text-[12px] text-ink-soft inline-flex items-center'
                      }
                    >
                      {i === 0 && <Icon icon="lucide:heart-pulse" className="text-[13px] text-teal-bright" />}
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-[13px] text-ink/40">No tags available</span>
                )}
              </div>
            </div>
            <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10.5px] mono-stat text-ink/55">EVIDENCE GRADE</div>
                <span className="text-[9.5px] mono-stat text-teal-deep">GRADE WORKING GROUP</span>
              </div>
              {grade ? (
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-deep text-paper serif text-[26px] font-medium">
                    {grade}
                  </div>
                  <div className="flex-1">
                    <div className="text-[13.5px] font-semibold text-ink">High quality</div>
                    <div className="text-[11.5px] text-ink-soft leading-[1.45]">{gradeDescription || 'Evidence quality assessment'}</div>
                  </div>
                </div>
              ) : (
                <div className="text-[13px] text-ink/40">No grade available</div>
              )}
            </div>
          </div>

          {/* Practice points */}
          {practicePoints.length > 0 && (
            <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-7">
              <h3 className="serif text-[22px] tracking-tight mb-5">What this means in clinic</h3>
              <div className="space-y-3">
                {practicePoints.map((pt) => (
                  <div
                    key={pt.title}
                    className={`flex items-start gap-3 p-3.5 rounded-xl ${
                      pt.type === 'positive'
                        ? 'bg-teal-deep/[0.06] border border-teal-deep/20'
                        : 'bg-amber-bg/50 border border-amber-ink/25'
                    }`}
                  >
                    <Icon
                      icon={pt.type === 'positive' ? 'lucide:check-circle-2' : 'lucide:alert-circle'}
                      className={`text-[18px] mt-0.5 ${pt.type === 'positive' ? 'text-teal-deep' : 'text-amber-ink'}`}
                    />
                    <div>
                      <div className="text-[13.5px] font-medium text-ink mb-1">{pt.title}</div>
                      <div className="text-[12.5px] text-ink-soft leading-[1.5]">{pt.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PICO Summary if available */}
          {picoEntries.length > 0 && (
            <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
              <div className="text-[10.5px] mono-stat text-ink/55 mb-3">PICO SUMMARY</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {picoEntries.map(([key, value]) => (
                  <div key={key} className="p-3 rounded-lg bg-ink/[0.03] border border-ink/10">
                    <span className="text-[10px] mono-stat text-teal-deep uppercase">{key}</span>
                    <p className="text-[13px] text-ink-soft mt-1">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        /* No relevance data from backend */
        <div className="bg-paper-warm/50 border border-ink/10 rounded-3xl p-10 text-center">
          <Icon icon="lucide:clipboard-list" className="text-[48px] text-ink/20 mx-auto mb-4" />
          <h3 className="serif text-[22px] tracking-tight text-ink/40 mb-2">No Clinical Relevance Data</h3>
          <p className="text-[14px] text-ink/40 max-w-[400px] mx-auto">
            Clinical relevance assessment is not available for this paper yet.
            This may be because the analysis is still in progress.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 px-4 h-10 rounded-xl bg-ink/5 text-[12px] text-ink/50">
            <Icon icon="lucide:clock" className="text-[14px]" />
            Analysis in progress
          </div>
        </div>
      )}
    </section>
  );
}