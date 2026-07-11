'use client';

import { useState, useRef } from 'react';
import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function InfographicPane({ paper }: { paper: Paper }) {
  const [downloading, setDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const infographicRef = useRef<HTMLDivElement>(null);

  const findings = paper.key_findings || {};

  // Headline from backend or title
  const headline = String(findings['headline'] || paper.title);
  const displayHeadline = headline.length > 80 ? headline.slice(0, 80) + '...' : headline;

  // Stats from backend or fallback
  const placeboRate = String(findings['placebo_rate'] || findings['control_rate'] || '—');
  const treatmentRate = String(findings['treatment_rate'] || findings['intervention_rate'] || '—');
  const reduction = String(findings['reduction'] || findings['effect_size'] || '');
  const hr = String(findings['hr'] || findings['hazard_ratio'] || '');
  const ci = String(findings['ci'] || findings['confidence_interval'] || '');
  const pValue = String(findings['p_value'] || findings['p'] || '');
  const nnt = String(findings['nnt'] || '');
  const n = String(findings['n'] || findings['sample_size'] || '—');

  // Footer from backend or auto-generated
  const footer = String(
    findings['footer'] || 
    `STUDY: ${paper.study_type?.toUpperCase() || 'OTHER'}\nPOPULATION: ${paper.specialty_tags?.join(', ') || 'N/A'}\nPROCESSED IN ${paper.processing_time?.toFixed(2) || '—'}S`
  );

  const studyType = paper.study_type?.toUpperCase() || 'OTHER';
  const tags = paper.specialty_tags?.slice(0, 3).join(' · ') || '';

  // Share URL
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
  const shareText = `${paper.title} - Clinical Summary`;

  const handleShare = async (platform: string) => {
    const urls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
    };

    if (platform === 'native' && navigator.share) {
      try {
        await navigator.share({
          title: paper.title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // User cancelled
      }
    } else if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = async (format: string) => {
    setDownloading(true);
    
    try {
      if (format === 'png' && infographicRef.current) {
        // Use html-to-image or canvas conversion
        const svgElement = infographicRef.current.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const img = new Image();
          
          canvas.width = 1200;
          canvas.height = 630;
          
          img.onload = () => {
            ctx?.drawImage(img, 0, 0, 1200, 630);
            const a = document.createElement('a');
            a.download = `${paper.id}-infographic.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
          };
          
          img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
        }
      } else if (format === 'svg') {
        const svgElement = infographicRef.current?.querySelector('svg');
        if (svgElement) {
          const svgData = new XMLSerializer().serializeToString(svgElement);
          const blob = new Blob([svgData], { type: 'image/svg+xml' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${paper.id}-infographic.svg`;
          a.click();
          URL.revokeObjectURL(url);
        }
      } else if (format === 'pdf') {
        window.print();
      }
    } finally {
      setTimeout(() => setDownloading(false), 1000);
    }
  };

  // Check if we have real stats
  const hasStats = reduction || hr || pValue;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 03 &middot; CLINICAL INFOGRAPHIC &middot; 1200 &times; 630
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => handleShare('linkedin')}
            className="w-8 h-8 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" 
            aria-label="LinkedIn"
          >
            <Icon icon="lucide:linkedin" className="text-[14px] text-ink-soft" />
          </button>
          <button 
            onClick={() => handleShare('twitter')}
            className="w-8 h-8 rounded-lg border border-ink/15 hover-tint inline-flex items-center justify-center" 
            aria-label="X"
          >
            <Icon icon="lucide:twitter" className="text-[14px] text-ink-soft" />
          </button>
          <button 
            onClick={() => handleShare('whatsapp')}
            className="w-8 h-8 rounded-lg bg-[#25D366]/15 border border-[#25D366]/30 hover:bg-[#25D366]/25 inline-flex items-center justify-center" 
            aria-label="WhatsApp"
          >
            <Icon icon="lucide:message-circle" className="text-[14px] text-ink" />
          </button>
        </div>
      </div>

      {/* Large Infographic */}
      <div ref={infographicRef} className="relative aspect-[1200/630] bg-ink rounded-3xl overflow-hidden border border-ink-soft">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-deep/30 via-transparent to-amber-ink/10" />
        <div className="absolute inset-0 grain-overlay" />

        {/* Top strip */}
        <div className="absolute top-0 left-0 right-0 px-6 py-3.5 flex items-center justify-between border-b border-paper/10 text-[10px] mono-stat text-paper/60">
          <span className="flex items-center gap-2">
            <span className="serif text-paper text-[14px] font-medium">C.</span>
            <span>CLARITAS &middot; CLINICAL SUMMARY</span>
          </span>
          <span className="hidden sm:inline">{studyType} &middot; {tags}</span>
          <span className="serif text-paper text-[11px]">{paper.has_errors ? 'REVIEW' : 'VALIDATED'}</span>
        </div>

        {/* Body */}
        <div className="absolute inset-0 pt-12 px-6 md:px-10 flex flex-col justify-center">
          <div className="text-[10px] mono-stat text-teal-bright mb-2">
            PRIMARY OUTCOME &middot; {studyType} &middot; n = {n}
          </div>
          
          {/* Headline */}
          <div className="serif text-paper text-[18px] md:text-[22px] lg:text-[26px] leading-[1.2] tracking-[-0.01em] mb-4 max-h-[90px] overflow-hidden">
            <span className="block break-words">
              {displayHeadline}
            </span>
          </div>

          {/* Stats visualization */}
          {hasStats ? (
            <div className="flex items-end gap-5 md:gap-8 mb-3">
              {/* Control/Placebo */}
              {placeboRate !== '—' && (
                <div className="flex flex-col gap-1.5">
                  <div className="w-20 h-24 md:w-24 md:h-28 bg-paper/15 rounded-md" />
                  <div className="text-[10px] mono-stat text-paper/55">{placeboRate}</div>
                </div>
              )}
              
              {/* Arrow */}
              {placeboRate !== '—' && treatmentRate !== '—' && (
                <div className="text-paper/30 text-[40px] mb-12">&rarr;</div>
              )}
              
              {/* Treatment */}
              {treatmentRate !== '—' && (
                <div className="flex flex-col gap-1.5">
                  <div className="w-20 h-[72px] md:w-24 md:h-[85px] bg-teal-bright rounded-md shadow-[0_0_30px_rgba(20,184,166,0.5)]" />
                  <div className="text-[10px] mono-stat text-teal-bright font-semibold">{treatmentRate}</div>
                </div>
              )}
              
              {/* Effect size */}
              <div className="ml-2 md:ml-6 mb-3">
                {reduction && (
                  <div className="serif text-paper text-[48px] md:text-[64px] leading-none font-medium">
                    {reduction}
                  </div>
                )}
                {hr && ci && (
                  <div className="text-[10px] mono-stat text-paper/55 mt-1">HR {hr} (CI {ci})</div>
                )}
                {pValue && nnt && (
                  <div className="text-[10px] mono-stat text-teal-bright mt-0.5">P {pValue} &middot; NNT {nnt}</div>
                )}
                {pValue && !nnt && (
                  <div className="text-[10px] mono-stat text-teal-bright mt-0.5">P {pValue}</div>
                )}
              </div>
            </div>
          ) : (
            /* No stats - show summary instead */
            <div className="mb-4 max-w-[500px]">
              <p className="text-[14px] text-paper/70 leading-[1.6]">
                {paper.tldr?.slice(0, 150)}...
              </p>
            </div>
          )}

          <div className="h-px bg-paper/15 my-4 max-w-[600px]" />

          <div className="text-[10px] mono-stat text-paper/45 leading-relaxed max-w-[600px] whitespace-pre-line">
            {footer}
          </div>
        </div>

        {/* Decorative corner */}
        <svg className="absolute bottom-0 right-0 w-44 h-44 opacity-[0.08]" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" stroke="#14b8a6" fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="30" stroke="#14b8a6" fill="none" strokeWidth="1" />
          <circle cx="50" cy="50" r="15" stroke="#14b8a6" fill="none" strokeWidth="1" />
        </svg>
      </div>

      {/* Export + share */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">DOWNLOAD AS</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => handleDownload('png')}
              disabled={downloading}
              className="h-10 px-3.5 rounded-xl bg-ink text-paper text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Icon icon={downloading ? 'lucide:loader-2' : 'lucide:download'} className={`text-[13px] text-teal-bright ${downloading ? 'animate-spin' : ''}`} />
              PNG 1200&times;630
            </button>
            <button 
              onClick={() => handleDownload('svg')}
              disabled={downloading}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint disabled:opacity-50"
            >
              <Icon icon="lucide:download" className="text-[13px] text-teal" />
              SVG VECTOR
            </button>
            <button 
              onClick={() => handleDownload('pdf')}
              disabled={downloading}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint disabled:opacity-50"
            >
              <Icon icon="lucide:download" className="text-[13px] text-teal" />
              PDF
            </button>
          </div>
        </div>
        <div className="bg-paper-warm/50 border border-ink/10 rounded-2xl p-5">
          <div className="text-[10.5px] mono-stat text-ink/55 mb-3">SHARE TO</div>
          <div className="flex items-center gap-2 flex-wrap">
            <button 
              onClick={() => handleShare('linkedin')}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon icon="lucide:linkedin" className="text-[13px] text-[#0A66C2]" />
              LinkedIn
            </button>
            <button 
              onClick={() => handleShare('twitter')}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon icon="lucide:twitter" className="text-[13px] text-ink" />
              X / Twitter
            </button>
            <button 
              onClick={() => handleShare('whatsapp')}
              className="h-10 px-3.5 rounded-xl bg-[#25D366] text-ink text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5"
            >
              <Icon icon="lucide:message-circle" className="text-[13px]" />
              WhatsApp
            </button>
            <button 
              onClick={handleCopyLink}
              className="h-10 px-3.5 rounded-xl border border-ink/15 text-ink-soft text-[11px] mono-stat font-semibold inline-flex items-center gap-1.5 hover-tint"
            >
              <Icon icon={copied ? 'lucide:check' : 'lucide:link'} className={`text-[13px] ${copied ? 'text-teal-deep' : 'text-teal'}`} />
              {copied ? 'COPIED!' : 'COPY LINK'}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}