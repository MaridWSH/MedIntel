import Icon from '../ui/Icon';

export default function SiteHeader() {
  return (
    <header className="z-30 border-b border-black/10 bg-paper/95 backdrop-blur-[6px] sticky top-0">
      <div className="max-w-[1380px] mx-auto px-6 h-[68px] flex items-center justify-between gap-6">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 shrink-0 group">
          <div className="relative w-9 h-9 bg-ink rounded-[10px] flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-teal-bright/30 via-transparent to-transparent" />
            <span className="text-paper text-xl font-medium tracking-tight relative serif">C</span>
            <div className="absolute w-1 h-1 bg-teal-bright rounded-full bottom-1.5 right-1.5" />
          </div>
          <span className="text-xl font-medium tracking-tight serif">Claritas</span>
        </a>

        {/* Primary nav */}
        <nav className="hidden lg:flex items-center gap-1 text-[13.5px]">
          <a href="#" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5 transition-all duration-200">
            How it works
          </a>
          <a href="#" className="px-3 py-2 rounded-md text-teal font-semibold transition-all duration-200">
            Evidence Engine
          </a>
          <a href="#" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5 transition-all duration-200">
            For institutions
          </a>
          <a href="#" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5 transition-all duration-200">
            Pricing
          </a>
          <a href="#" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5 transition-all duration-200">
            CME credits
          </a>
          <a href="#" className="px-3 py-2 rounded-md text-ink-soft hover:bg-ink/5 transition-all duration-200">
            Docs
          </a>
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Language dropdown */}
          <div className="relative group">
            <button className="flex items-center gap-1.5 px-2.5 h-9 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
              <Icon icon="lucide:globe" className="text-[14px] text-teal" />
              <span>EN</span>
              <span className="text-ink/30">&middot;</span>
              <span className="text-ink/55">&Arabic;</span>
              <Icon icon="lucide:chevron-down" className="text-[13px] text-ink/40" />
            </button>
          </div>

          {/* Sign in */}
          <a href="#" className="hidden md:inline-flex items-center px-3 h-9 rounded-md text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
            Sign in
          </a>

          {/* Try Free */}
          <a href="#" className="inline-flex items-center gap-1.5 px-4 h-9 rounded-md bg-teal-deep text-paper text-[12.5px] font-semibold btn-primary">
            Try Free
            <Icon icon="lucide:arrow-right" className="text-[14px]" />
          </a>
        </div>
      </div>
    </header>
  );
}
