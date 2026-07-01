import { Sparkles, FilterX, Library, LucideIcon } from "lucide-react";

interface Tip {
  icon: LucideIcon;
  title: string;
  body: React.ReactNode;
}

const TIPS: Tip[] = [
  {
    icon: Sparkles,
    title: "Ask in plain Arabic or English",
    body: (
      <>
        Type &ldquo;أفضل علاج لفشل القلب مع الحفاظ على القذف&rdquo; or &ldquo;best
        therapy for HFrEF&rdquo; — the engine handles both.
      </>
    ),
  },
  {
    icon: FilterX,
    title: "Combine filters with operators",
    body: (
      <>
        Use{" "}
        <code className="px-1 py-0.5 rounded bg-ink/8 font-mono text-[10.5px]">
          NOT pediatric
        </code>{" "}
        or{" "}
        <code className="px-1 py-0.5 rounded bg-ink/8 font-mono text-[10.5px]">
          (&quot;heart failure&quot; OR HFpEF)
        </code>{" "}
        right in the search bar.
      </>
    ),
  },
  {
    icon: Library,
    title: "Build a systematic review corpus",
    body: "Select papers, then export a PRISMA-ready bundle with citations in your preferred format.",
  },
];

export default function TipsSection() {
  return (
    <section className="relative pb-12 max-w-[1380px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {TIPS.map((tip) => (
          <div
            key={tip.title}
            className="bg-paper-warm/60 border border-ink/12 rounded-2xl p-5 flex items-start gap-3"
          >
            <div className="w-9 h-9 rounded-lg bg-ink text-paper flex items-center justify-center shrink-0">
              <tip.icon className="text-teal-bright" size={16} />
            </div>
            <div>
              <h3 className="font-serif text-[15px] tracking-tight mb-1">
                {tip.title}
              </h3>
              <p className="text-[11.5px] text-ink-soft leading-[1.5]">
                {tip.body}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
