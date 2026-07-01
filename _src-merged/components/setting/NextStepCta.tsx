import Link from "next/link";
import { ArrowRight, ArrowUp } from "lucide-react";

interface NextStepCtaProps {
  href: string;
  title: string;
  meta: string;
}

export default function NextStepCta({ href, title, meta }: NextStepCtaProps) {
  return (
    <div className="mt-14 pt-8 border-t border-ink/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div>
        <div className="text-[10px] mono-stat text-teal-deep mb-2">NEXT STEP</div>
        <Link
          href={href}
          className="font-serif text-[20px] md:text-[24px] tracking-tight text-ink hover:text-teal-deep transition-colors inline-flex items-center gap-2"
        >
          {title}
          <ArrowRight size={18} />
        </Link>
        <p className="text-[11.5px] text-ink-soft mt-1.5">{meta}</p>
      </div>
      <Link
        href="#subscription"
        className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-md border border-ink/12 text-ink-soft text-[12px] font-medium hover:bg-ink/5 transition-colors"
      >
        <ArrowUp size={13} />
        Back to top
      </Link>
    </div>
  );
}
