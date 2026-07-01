import Icon from '../../ui/Icon';
import type { Paper } from '../../../lib/papers/types';

export default function MindMapPane({ paper }: { paper: Paper }) {
  const { mindmap } = paper;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10.5px] mono-stat text-ink/55">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-bright cursor-blink" />
          AGENT 02 &middot; INTERACTIVE KNOWLEDGE GRAPH &middot; 1.6s
        </div>
        <div className="flex items-center gap-1.5">
          <div className="inline-flex items-center gap-1 px-2 h-7 rounded-md border border-ink/15 hover-tint cursor-pointer text-[10.5px] mono-stat">
            <Icon icon="lucide:layout" className="text-[12px] text-teal" />
            SPATIAL
          </div>
          <div className="inline-flex items-center gap-1 px-2 h-7 rounded-md bg-ink text-paper text-[10.5px] mono-stat">
            <Icon icon="lucide:git-fork" className="text-[12px] text-teal-bright" />
            RADIAL
          </div>
        </div>
      </div>

      {/* Mind Map Canvas */}
      <div className="relative bg-ink rounded-3xl overflow-hidden h-[620px] border border-ink-soft">
        {/* Grid background */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none">
          <pattern id="grid-dot" width="28" height="28" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.8" fill="#f6f3ea" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid-dot)" />
        </svg>

        {/* Center halo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-teal-bright/15 blur-3xl pointer-events-none" />

        {/* Mind Map SVG */}
        <svg viewBox="0 0 900 620" className="absolute inset-0 w-full h-full">
          <defs>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Rotating ring */}
          <g className="rotate-slow" style={{ transformOrigin: '450px 310px' }}>
            <circle cx="450" cy="310" r="240" fill="none" stroke="#14b8a6" strokeWidth="0.5" strokeDasharray="3 8" opacity="0.25" />
            <circle cx="450" cy="310" r="180" fill="none" stroke="#14b8a6" strokeWidth="0.4" strokeDasharray="2 10" opacity="0.18" />
          </g>

          {/* Connections */}
          <g stroke="#14b8a6" fill="none">
            <path d="M 450 310 Q 280 220, 180 145" strokeWidth="1.4" opacity="0.6" strokeDasharray="4 4" className="dash-flow" />
            <path d="M 450 310 Q 600 200, 730 130" strokeWidth="1.4" opacity="0.6" />
            <path d="M 450 310 Q 200 310, 100 310" strokeWidth="1.4" opacity="0.6" />
            <path d="M 450 310 Q 700 310, 815 310" strokeWidth="1.4" opacity="0.6" />
            <path d="M 450 310 Q 280 400, 180 475" strokeWidth="1.4" opacity="0.6" />
            <path d="M 450 310 Q 600 420, 730 490" strokeWidth="1.4" opacity="0.6" strokeDasharray="4 4" className="dash-flow" />
          </g>

          {/* Sub-branches */}
          <g stroke="#5eaaa0" fill="none" opacity="0.4" strokeWidth="1">
            <path d="M 180 145 L 80 95" />
            <path d="M 180 145 L 95 175" />
            <path d="M 730 130 L 830 90" />
            <path d="M 730 130 L 820 165" />
            <path d="M 100 310 L 35 270" />
            <path d="M 100 310 L 35 350" />
            <path d="M 815 310 L 870 270" />
            <path d="M 815 310 L 870 350" />
            <path d="M 180 475 L 80 525" />
            <path d="M 180 475 L 105 440" />
            <path d="M 730 490 L 830 530" />
            <path d="M 730 490 L 825 455" />
          </g>

          {/* Center Node */}
          <g>
            <circle cx="450" cy="310" r="78" fill="#0b1d2a" stroke="#14b8a6" strokeWidth="2" filter="url(#glow)" />
            <circle cx="450" cy="310" r="62" fill="none" stroke="#14b8a6" strokeWidth="0.6" opacity="0.5" />
            <text x="450" y="285" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="9" fontWeight="600" fill="#5eaaa0" letterSpacing="1.5">
              CORE FINDING
            </text>
            <text x="450" y="312" textAnchor="middle" fontFamily="JetBrains Mono" fontSize="22" fontWeight="700" fill="#14b8a6">
              &ndash;21%
            </text>
            <text x="450" y="330" textAnchor="middle" fontFamily="Inter" fontSize="9" fill="#f6f3ea" opacity="0.6">
              3-pt MACE
            </text>
          </g>

          {/* Data nodes */}
          {mindmap.nodes.map((node) => (
            <g key={node.id} className="cursor-pointer">
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="10"
                fill="#1a2c3a"
                stroke={node.accent === 'amber' ? '#967338' : '#14b8a6'}
                strokeWidth={node.id === 'results' ? 1.4 : 1}
                opacity="0.96"
              />
              <text
                x={node.x + 15}
                y={node.y + 20}
                fontFamily="JetBrains Mono"
                fontSize="8.5"
                fontWeight="600"
                fill={node.accent === 'amber' ? '#cab57d' : '#5eaaa0'}
                letterSpacing="1"
              >
                {node.label}
              </text>
              <text
                x={node.x + 15}
                y={node.y + 38}
                fontFamily="Inter"
                fontSize="12"
                fontWeight="600"
                fill="#f6f3ea"
              >
                {node.sublabel}
              </text>
            </g>
          ))}

          {/* Focus ring on Results node */}
          <circle cx="730" cy="130" r="84" fill="none" stroke="#14b8a6" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.65">
            <animate attributeName="r" values="84;92;84" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.65;0.25;0.65" dur="2.6s" repeatCount="indefinite" />
          </circle>
        </svg>

        {/* Zoom controls */}
        <div className="absolute bottom-4 left-4 inline-flex flex-col gap-1">
          {['lucide:plus', 'lucide:minus', 'lucide:maximize'].map((icon) => (
            <button
              key={icon}
              className="w-9 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 hover:bg-paper/20 inline-flex items-center justify-center"
            >
              <Icon icon={icon} className="text-[14px] text-paper" />
            </button>
          ))}
        </div>
        <div className="absolute bottom-4 right-4 inline-flex items-center gap-2 px-3 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 text-[10px] mono-stat text-paper/70">
          <span>12 NODES &middot; 6 BRANCHES</span>
          <span className="text-paper/30">&middot;</span>
          <span className="text-teal-bright">CLICK &rarr; SOURCE</span>
        </div>
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 h-9 rounded-xl bg-paper/10 backdrop-blur-md border border-paper/15 text-[10.5px] mono-stat text-paper/70 font-medium">
          <span>REACT FLOW</span>
          <span className="text-paper/30">&middot;</span>
        </div>
      </div>

      {/* Source panel */}
      <div className="bg-ink rounded-2xl p-5 text-paper">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-[10.5px] mono-stat text-teal-bright">
            <Icon icon="lucide:link-2" className="text-[13px]" />
            {mindmap.source.ref}
          </div>
          <button className="text-[10.5px] mono-stat text-paper/55 hover:text-teal-bright">COPY CITE &nearr;</button>
        </div>
        <p className="serif-body text-[14.5px] text-paper/85 leading-[1.55] italic">
          {mindmap.source.quote}
        </p>
        <div className="mt-3 text-[10.5px] mono-stat text-paper/40">{mindmap.source.cite}</div>
      </div>

      {/* Export row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {[
          { icon: 'lucide:image', label: 'DOWNLOAD PNG', primary: true },
          { icon: 'lucide:code-2', label: 'EXPORT SVG', primary: false },
          { icon: 'lucide:file-text', label: 'JSON GRAPH', primary: false },
          { icon: 'lucide:external-link', label: 'EMBED', primary: false },
        ].map((btn) => (
          <button
            key={btn.label}
            className={`h-11 rounded-xl inline-flex items-center justify-center gap-2 text-[11px] mono-stat font-semibold ${
              btn.primary
                ? 'bg-ink text-paper btn-primary'
                : 'border border-ink/15 hover-tint text-ink-soft'
            }`}
          >
            <Icon icon={btn.icon} className={`text-[14px] ${btn.primary ? 'text-teal-bright' : 'text-teal'}`} />
            {btn.label}
          </button>
        ))}
      </div>
    </section>
  );
}
