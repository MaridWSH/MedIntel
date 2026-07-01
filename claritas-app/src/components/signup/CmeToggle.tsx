interface CmeToggleProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function CmeToggle({ enabled, onToggle }: CmeToggleProps) {
  return (
    <div className="mt-4 bg-paper-warm border border-ink-12 rounded-2xl p-5 flex items-start md:items-center gap-4 flex-col md:flex-row">
      <div className="flex items-start gap-3 flex-1">
        <div className="w-10 h-10 rounded-xl bg-teal-deep/12 border border-teal-deep/25 flex items-center justify-center shrink-0">
          <iconify-icon icon="lucide:award" className="text-[20px] text-teal-deep"></iconify-icon>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="serif text-[18px] tracking-tight leading-tight">CME bundle</h4>
            <span className="px-1.5 h-5 rounded bg-teal-deep/12 text-teal-deep text-[9px] mono-stat font-semibold inline-flex items-center">ADD-ON</span>
            <span className="px-1.5 h-5 rounded bg-ink/8 text-ink/55 text-[9px] mono-stat inline-flex items-center">+ $9 / MO</span>
          </div>
          <p className="text-[12px] text-ink-soft leading-[1.5] max-w-[440px]">
            Auto-graded quizzes per paper. Track credit hours by specialty. Certificates co-branded with the Egyptian Medical Syndicate and Arab Board.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3 self-end md:self-center">
        <span className="text-[10.5px] mono-stat text-ink/55">ADD</span>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => onToggle(!enabled)}
          className={`toggle-switch large ${enabled ? "on" : ""}`}
        >
          <div className="toggle-switch-thumb"></div>
        </button>
        <span className={`text-[10.5px] mono-stat w-8 ${enabled ? "text-teal-deep font-semibold" : "text-ink/55"}`}>{enabled ? "ON" : "OFF"}</span>
      </div>
    </div>
  );
}
