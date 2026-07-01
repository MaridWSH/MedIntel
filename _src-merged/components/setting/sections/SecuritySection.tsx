"use client";

import {
  LockKeyhole,
  Monitor,
  Smartphone,
  Archive,
  FileText,
  Trash2,
  Eye,
  Download,
} from "lucide-react";
import Toggle from "@/components/ui/Toggle";
import { SESSIONS } from "@/lib/settings-data";

const SESSION_ICONS = { monitor: Monitor, smartphone: Smartphone };

export default function SecuritySection() {
  return (
    <article id="security" className="scroll-mt-28">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-tight">
          Security &amp; Privacy
        </h2>
        <span className="text-[10px] mono-stat text-ink/40">04 / 05</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Authentication + sessions */}
        <div className="col-span-12 md:col-span-7 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <LockKeyhole className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">Authentication</h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-4">
            Your medical license number is used only for verification and
            stored encrypted.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between pb-4 border-b border-ink/8">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Two-factor authentication
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Authenticator app · Last verified 11 Dec 2024
                </div>
              </div>
              <span className="px-2 h-6 rounded text-[9.5px] mono-stat bg-teal-deep/12 text-teal-deep font-semibold inline-flex items-center">
                ENABLED
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Biometric unlock (mobile)
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Face ID / fingerprint on iOS &amp; Android apps
                </div>
              </div>
              <Toggle defaultOn label="Biometric unlock" />
            </div>
          </div>

          <div className="h-px bg-ink/8 my-5" />

          <div className="text-[10px] mono-stat text-ink/45 mb-3">
            ACTIVE SESSIONS
          </div>
          <ul className="space-y-2.5">
            {SESSIONS.map((session) => {
              const Icon = SESSION_ICONS[session.icon];
              return (
                <li key={session.id} className="flex items-center gap-3 text-[12px]">
                  <div
                    className={`w-7 h-7 rounded-md inline-flex items-center justify-center ${
                      session.current
                        ? "bg-teal-deep/12 text-teal-deep"
                        : "bg-ink/8 text-ink-soft"
                    }`}
                  >
                    <Icon size={13} />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-ink">{session.device}</div>
                    <div className="text-[10px] mono-stat text-ink/45">
                      {session.meta}
                    </div>
                  </div>
                  {!session.current && (
                    <button className="text-[10px] mono-stat text-rose-ink hover:underline">
                      REVOKE
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Data export / deletion */}
        <div className="col-span-12 md:col-span-5 bg-paper-warm border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Archive className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">Your Data</h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-5">
            Export or delete everything Claritas knows about your reading,
            searches, and CME history.
          </p>

          <div className="space-y-3">
            <button className="w-full text-left block p-3.5 rounded-lg border border-ink/12 hover:bg-ink/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">
                    Export all data
                  </div>
                  <div className="text-[10.5px] text-ink/55 mt-0.5">
                    JSON · includes saved papers, history, CME transcript
                  </div>
                </div>
                <Download className="text-teal-deep" size={14} />
              </div>
            </button>
            <button className="w-full text-left block p-3.5 rounded-lg border border-ink/12 hover:bg-ink/5 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] font-semibold text-ink">
                    Export CME transcript
                  </div>
                  <div className="text-[10.5px] text-ink/55 mt-0.5">
                    PDF · co-branded with EG-MS, AB-2938
                  </div>
                </div>
                <FileText className="text-teal-deep" size={14} />
              </div>
            </button>
            <button className="w-full text-left block p-3.5 rounded-lg border border-rose-ink/20 bg-rose-bg/40">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[12.5px] font-semibold text-rose-ink">
                    Delete account
                  </div>
                  <div className="text-[10.5px] text-rose-ink/75 mt-0.5">
                    Permanent · 30-day grace period
                  </div>
                </div>
                <Trash2 className="text-rose-ink" size={14} />
              </div>
            </button>
          </div>
        </div>

        {/* Tracking & cookies */}
        <div className="col-span-12 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Eye className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">
              Tracking &amp; Cookies
            </h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-5">
            Claritas uses only first-party analytics. We never sell data to
            third parties. HIPAA-aligned · PHI-licensed.
          </p>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Functional cookies
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Required for login, language, saved papers
                </div>
              </div>
              <Toggle defaultOn label="Functional cookies" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">Usage analytics</div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Anonymized · used to improve agent accuracy
                </div>
              </div>
              <Toggle defaultOn label="Usage analytics" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Third-party tracking
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Always off · we never enable this
                </div>
              </div>
              <Toggle disabled label="Third-party tracking (always off)" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
