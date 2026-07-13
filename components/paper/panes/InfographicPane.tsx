'use client';

import { useState, useRef } from 'react';
import { toPng } from 'html-to-image';
import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

/**
 * Shareable summary card.
 *
 * Stats come from `key_finding` (SINGULAR) — that is the only place the API puts
 * hr/ci/p_value/nnt/n/reduction. This pane used to read them from `key_findings`
 * (plural), where they never exist, so the stats block was permanently dead.
 *
 * Export renders the actual card element. The old version did
 * querySelector('svg'), which picked up the decorative corner rings and
 * downloaded an image of three circles.
 */

export default function InfographicPane({ paper }: { paper: Paper }) {
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const kf = paper.key_finding;

  const headline = kf?.headline || paper.tldr || paper.title;
  const displayHeadline = headline.length > 180 ? `${headline.slice(0, 180)}…` : headline;

  const stats = [
    kf?.reduction ? { label: 'REDUCTION', value: kf.reduction } : null,
    kf?.hr != null ? { label: 'HR', value: String(kf.hr) } : null,
    kf?.ci ? { label: '95% CI', value: kf.ci } : null,
    kf?.p_value != null ? { label: 'P', value: String(kf.p_value) } : null,
    kf?.nnt != null ? { label: 'NNT', value: String(kf.nnt) } : null,
    kf?.n != null ? { label: 'N', value: kf.n.toLocaleString() } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const studyType = paper.study_type?.toUpperCase() || 'STUDY';
  const tags = paper.specialty_tags?.slice(0, 3).join(' · ') || '';
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${paper.title} — AI summary on Claritas`;

  const share = (platform: string) => {
    const urls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const downloadPng = async () => {
    if (!cardRef.current) return;
    setBusy(true);
    try {
      const dataUrl = await toPng(cardRef.current, { pixelRatio: 2, cacheBust: true });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `${paper.id}-summary.png`;
      a.click();
    } catch (err) {
      console.error('Infographic export failed:', err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 03 &middot; SHAREABLE CARD
        </div>
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className="relative aspect-[1200/630] bg-ink rounded-3xl overflow-hidden border border-ink-soft"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-deep/30 via-transparent to-amber-ink/10" />

        <div className="absolute top-0 left-0 right-0 px-6 py-3.5 flex items-center justify-between border-b border-paper/10 text-[10px] mono-stat text-paper/60">
          <span className="flex items-center gap-2">
            <span className="serif text-paper text-[14px] font-medium">C.</span>
            <span>CLARITAS &middot; AI SUMMARY</span>
          </span>
          <span className="hidden sm:inline truncate max-w-[45%]">
            {studyType}
            {tags && ` · ${tags}`}
          </span>
        </div>

        <div className="absolute inset-0 pt-14 pb-12 px-6 md:px-10 flex flex-col justify-center">
          <div className="text-[10px] mono-stat text-teal-bright mb-3">
            KEY FINDING{kf?.n != null ? ` · n = ${kf.n.toLocaleString()}` : ''}
          </div>

          <div className="serif text-paper text-[17px] md:text-[21px] lg:text-[24px] leading-[1.3] tracking-[-0.01em] mb-5 max-w-[820px]">
            {displayHeadline}
          </div>

          {stats.length > 0 && (
            <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
              {stats.map((s) => (
                <div key={s.label}>
                  <div className="text-[9.5px] mono-stat text-paper/45 mb-0.5">{s.label}</div>
                  <div className="serif text-paper text-[24px] md:text-[30px] leading-none">{s.value}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Provenance — a card that leaves the site must carry its own caveat. */}
        <div className="absolute bottom-0 left-0 right-0 px-6 py-3 border-t border-paper/10 flex items-center justify-between text-[9.5px] mono-stat text-paper/45">
          <span className="truncate max-w-[60%]">{paper.journal || paper.id}</span>
          <span>AI-GENERATED · NOT CLINICAL ADVICE</span>
        </div>
      </div>

      {!kf && (
        <p className="text-[12.5px] text-ink/50 px-1">
          No structured key finding was extracted for this paper, so the card shows the TL;DR instead.
        </p>
      )}

      {/* Export + share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">DOWNLOAD</div>
          <button
            onClick={downloadPng}
            disabled={busy}
            className="h-10 px-3.5 rounded-xl bg-ink text-paper text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
          >
            <Icon
              icon={busy ? 'lucide:loader-2' : 'lucide:download'}
              className={`text-[13px] text-teal-bright ${busy ? 'animate-spin' : ''}`}
            />
            {busy ? 'RENDERING…' : 'PNG'}
          </button>
        </div>

        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">SHARE TO</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => share('linkedin')}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon icon="lucide:linkedin" className="text-[13px] text-[#0A66C2]" />
              LinkedIn
            </button>
            <button
              onClick={() => share('twitter')}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon icon="lucide:twitter" className="text-[13px] text-ink" />
              X
            </button>
            <button
              onClick={() => share('whatsapp')}
              className="h-10 px-3.5 rounded-xl bg-[#25D366] text-ink text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5"
            >
              <Icon icon="lucide:message-circle" className="text-[13px]" />
              WhatsApp
            </button>
            <button
              onClick={copyLink}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon
                icon={copied ? 'lucide:check' : 'lucide:link'}
                className={`text-[13px] ${copied ? 'text-teal-deep' : 'text-teal'}`}
              />
              {copied ? 'COPIED' : 'COPY LINK'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
