import { User, Mail, Building2, Shield, Bell, CreditCard } from "lucide-react";

export default function SettingsPage() {
  return (
    <main className="max-w-[1380px] mx-auto px-6 py-12">
      <div className="max-w-2xl">
        <h1 className="display text-[32px] tracking-tight mb-2">Account settings</h1>
        <p className="serif-body text-ink-soft mb-8">Manage your profile, credentials, and notifications.</p>

        <section className="space-y-6">
          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <h2 className="font-serif text-[18px] tracking-tight mb-4 flex items-center gap-2">
              <User size={18} className="text-teal-deep" /> Profile
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">FULL NAME</label>
                <input defaultValue="Dr. Hana El-Sayed" className="w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-10 text-[13px] outline-none focus:border-teal-deep" />
              </div>
              <div>
                <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">EMAIL</label>
                <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-10 text-[13px]">
                  <Mail size={14} className="text-ink/40" />
                  <span className="text-ink-soft">hana.elsayed@hospital.eg</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">INSTITUTION</label>
                <div className="flex items-center gap-2 w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-10 text-[13px]">
                  <Building2 size={14} className="text-ink/40" />
                  <span className="text-ink-soft">Cairo University Hospitals</span>
                </div>
              </div>
              <div>
                <label className="text-[11px] mono-stat text-ink/55 block mb-1.5">ROLE</label>
                <input defaultValue="Cardiologist" className="w-full bg-ink/[0.04] border border-ink/10 rounded-md px-3 h-10 text-[13px] outline-none focus:border-teal-deep" />
              </div>
            </div>
          </div>

          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <h2 className="font-serif text-[18px] tracking-tight mb-4 flex items-center gap-2">
              <Shield size={18} className="text-teal-deep" /> Security
            </h2>
            <div className="space-y-3">
              <button className="px-4 h-10 rounded-md bg-ink text-paper text-[12.5px] font-semibold hover:bg-teal-deep transition-colors">
                Change password
              </button>
              <button className="ml-3 px-4 h-10 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
                Enable 2FA
              </button>
            </div>
          </div>

          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <h2 className="font-serif text-[18px] tracking-tight mb-4 flex items-center gap-2">
              <Bell size={18} className="text-teal-deep" /> Notifications
            </h2>
            <label className="flex items-center gap-3 text-[13px] cursor-pointer">
              <input type="checkbox" defaultChecked className="accent-teal-deep w-4 h-4" />
              Weekly literature digest
            </label>
            <label className="flex items-center gap-3 text-[13px] cursor-pointer mt-3">
              <input type="checkbox" defaultChecked className="accent-teal-deep w-4 h-4" />
              New validation alerts for saved searches
            </label>
          </div>

          <div className="bg-paper border border-ink/12 rounded-2xl p-5">
            <h2 className="font-serif text-[18px] tracking-tight mb-4 flex items-center gap-2">
              <CreditCard size={18} className="text-teal-deep" /> Billing
            </h2>
            <p className="text-[13px] text-ink-soft mb-3">Current plan: <span className="font-semibold text-ink">Pro · Institutional</span></p>
            <button className="px-4 h-10 rounded-md border border-ink/15 text-[12.5px] font-medium hover:bg-ink/5 transition-colors">
              Manage seats & invoices
            </button>
          </div>

          <div className="flex justify-end">
            <button className="px-6 h-11 rounded-md bg-teal-deep text-paper text-[13px] font-semibold hover:bg-ink transition-colors">
              Save changes
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
