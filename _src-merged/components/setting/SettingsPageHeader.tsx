interface SettingsPageHeaderProps {
  initials: string;
  name: string;
  meta: string;
}

export default function SettingsPageHeader({
  initials,
  name,
  meta,
}: SettingsPageHeaderProps) {
  return (
    <header className="mb-10 lg:mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
      <div>
        <div className="text-[10.5px] mono-stat text-teal-deep mb-4">
          § SETTINGS
        </div>
        <h1 className="display text-[44px] md:text-[64px] tracking-tight">
          Account <span className="italic text-teal">settings</span>.
        </h1>
        <p className="serif-body text-[16px] md:text-[17px] text-ink-soft leading-[1.5] mt-3 max-w-[560px]">
          Manage your subscription, CME credits, language preferences and
          privacy controls. Changes save automatically.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <div className="flex items-center gap-2.5 px-3.5 h-10 rounded-full bg-ink/[0.04] border border-ink/10">
          <div className="relative w-7 h-7 rounded-full bg-teal-deep/20 border border-teal-deep/40 flex items-center justify-center text-[10px] font-semibold text-teal-deep font-serif">
            {initials}
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-[11.5px] font-semibold text-ink">{name}</span>
            <span className="text-[9px] mono-stat text-ink/50 mt-0.5">{meta}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
