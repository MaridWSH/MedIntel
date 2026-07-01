import Link from "next/link";
import { ArrowRight, Mail, Lock, User, Building2 } from "lucide-react";

export default function SignUpPage() {
  return (
    <main className="flex-1 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="display text-[32px] tracking-tight mb-2">Start your trial</h1>
          <p className="serif-body text-ink-soft">14 days of full access. No credit card required.</p>
        </div>

        <div className="bg-paper border border-ink/12 rounded-2xl p-6 shadow-[0_8px_24px_-6px_rgba(11,29,42,0.1)]">
          <form className="space-y-4">
            <div>
              <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">FULL NAME</label>
              <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-11 focus-within:border-teal-deep transition-colors">
                <User size={15} className="text-ink/40" />
                <input type="text" placeholder="Dr. Hana El-Sayed" className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink/35" />
              </div>
            </div>

            <div>
              <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">EMAIL</label>
              <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-11 focus-within:border-teal-deep transition-colors">
                <Mail size={15} className="text-ink/40" />
                <input type="email" placeholder="you@hospital.eg" className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink/35" />
              </div>
            </div>

            <div>
              <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">INSTITUTION</label>
              <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-11 focus-within:border-teal-deep transition-colors">
                <Building2 size={15} className="text-ink/40" />
                <input type="text" placeholder="Cairo University Hospitals" className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink/35" />
              </div>
            </div>

            <div>
              <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">PASSWORD</label>
              <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-11 focus-within:border-teal-deep transition-colors">
                <Lock size={15} className="text-ink/40" />
                <input type="password" placeholder="••••••••" className="flex-1 bg-transparent outline-none text-[13px] placeholder:text-ink/35" />
              </div>
            </div>

            <button type="submit" className="w-full h-11 rounded-md bg-teal-deep text-paper text-[13px] font-semibold hover:bg-ink transition-colors flex items-center justify-center gap-1.5">
              Create account <ArrowRight size={14} />
            </button>
          </form>

          <div className="mt-5 text-center text-[12px] text-ink/55">
            Already have an account? <Link href="/signin" className="text-teal-deep font-medium hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  );
}

