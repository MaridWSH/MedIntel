"use client";

import { useState } from "react";
import { Globe, SunMoon, Mail } from "lucide-react";
import RadioOption from "@/components/ui/RadioOption";
import Toggle from "@/components/ui/Toggle";
import { DIGEST_FREQUENCIES } from "@/lib/settings-data";

type Language = "en" | "ar";
type Theme = "light" | "dark" | "auto";

const THEMES: { id: Theme; label: string; helper: string; swatch: React.ReactNode }[] = [
  {
    id: "light",
    label: "Light",
    helper: "DEFAULT",
    swatch: <div className="w-full h-10 rounded bg-paper border border-ink/10" />,
  },
  {
    id: "dark",
    label: "Dark",
    helper: "ACTIVE",
    swatch: <div className="w-full h-10 rounded bg-ink" />,
  },
  {
    id: "auto",
    label: "Auto",
    helper: "SYSTEM",
    swatch: (
      <div
        className="w-full h-10 rounded"
        style={{ background: "linear-gradient(180deg, #f6f3ea 50%, #0b1d2a 50%)" }}
      />
    ),
  },
];

export default function PreferencesSection() {
  const [language, setLanguage] = useState<Language>("en");
  const [theme, setTheme] = useState<Theme>("dark");
  const [digest, setDigest] = useState<(typeof DIGEST_FREQUENCIES)[number]["id"]>("daily");

  return (
    <article id="preferences" className="scroll-mt-28">
      <div className="flex items-baseline justify-between mb-4">
        <h2 className="font-serif text-[26px] md:text-[30px] tracking-tight">
          Preferences
        </h2>
        <span className="text-[10px] mono-stat text-ink/40">03 / 05</span>
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Language & direction */}
        <div className="col-span-12 md:col-span-7 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <Globe className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">
              Language &amp; Direction
            </h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-4">
            Arabic switches the entire interface to RTL, including labels,
            search corpora and email digests.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            <RadioOption
              active={language === "en"}
              onClick={() => setLanguage("en")}
              className={`border rounded-lg p-3 ${
                language === "en" ? "border-teal-deep bg-teal-deep/[0.04]" : "border-ink/12"
              }`}
            >
              <div className="flex-1">
                <div className="text-[13px] font-medium text-ink">English (LTR)</div>
                <div className="text-[10px] mono-stat text-ink/45 mt-0.5">
                  ENGLISH CORPUS
                </div>
              </div>
              <span className="text-[16px] text-ink/35 font-serif">EN</span>
            </RadioOption>
            <RadioOption
              active={language === "ar"}
              onClick={() => setLanguage("ar")}
              className={`border rounded-lg p-3 ${
                language === "ar" ? "border-teal-deep bg-teal-deep/[0.04]" : "border-ink/12"
              }`}
            >
              <div className="flex-1">
                <div className="text-[13px] font-medium text-ink">العربية (RTL)</div>
                <div className="text-[10px] mono-stat text-ink/45 mt-0.5">
                  ARABIC CORPUS · RTL LAYOUT
                </div>
              </div>
              <span className="text-[18px] text-ink/35 font-serif">ع</span>
            </RadioOption>
          </div>

          <div className="h-px bg-ink/8 my-5" />

          <div className="text-[10px] mono-stat text-ink/45 mb-3">SEARCH CONTENT</div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Search English corpus
                </div>
                <div className="text-[10.5px] text-ink/55">
                  PubMed, Scopus, NEJM, JAMA, Lancet
                </div>
              </div>
              <Toggle defaultOn label="Search English corpus" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Search Arabic abstracts
                </div>
                <div className="text-[10.5px] text-ink/55">
                  EMRO, Eastern Mediterranean Health Journal
                </div>
              </div>
              <Toggle defaultOn label="Search Arabic abstracts" />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="col-span-12 md:col-span-5 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center gap-2.5 mb-1.5">
            <SunMoon className="text-teal-deep" size={16} />
            <h4 className="text-[13px] font-semibold text-ink">Appearance</h4>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-4">
            Optimize screen for between-rounds reading.
          </p>

          <div className="grid grid-cols-3 gap-2">
            {THEMES.map((t) => {
              const active = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`text-left rounded-lg p-3 transition-colors ${
                    active
                      ? "border-2 border-teal-deep bg-teal-deep/[0.04]"
                      : "border border-ink/12 hover:bg-ink/5"
                  }`}
                >
                  <div className="mb-2.5">{t.swatch}</div>
                  <div className="text-[11px] font-medium">{t.label}</div>
                  <div
                    className={`text-[9px] mono-stat ${
                      active ? "text-teal-deep" : "text-ink/45"
                    }`}
                  >
                    {t.helper}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="h-px bg-ink/8 my-5" />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[12.5px] font-medium text-ink">Reduce motion</div>
              <Toggle label="Reduce motion" />
            </div>
            <div className="flex items-center justify-between">
              <div className="text-[12.5px] font-medium text-ink">
                Larger typography
              </div>
              <Toggle label="Larger typography" />
            </div>
          </div>
        </div>

        {/* Email notifications */}
        <div className="col-span-12 bg-paper border border-ink/12 rounded-2xl p-6 md:p-7">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-2.5">
              <Mail className="text-teal-deep" size={16} />
              <h4 className="text-[13px] font-semibold text-ink">
                Email Notifications
              </h4>
            </div>
            <span className="text-[10px] mono-stat text-ink/45">
              SENT TO K.EL-SHERIF@CARDIOLOGY.EG
            </span>
          </div>
          <p className="text-[11.5px] text-ink-soft mb-5">
            Decide what reaches your inbox. WhatsApp-sharing of infographics
            is unaffected.
          </p>

          <div className="space-y-4">
            {/* Digest frequency */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-ink/8">
              <div>
                <div className="text-[12.5px] font-semibold text-ink">
                  Practice-changing paper digest
                </div>
                <div className="text-[11px] text-ink-soft mt-1">
                  Curated by Agent 05 · Specialty-matched to Cardiology &amp;
                  Internal Medicine.
                </div>
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {DIGEST_FREQUENCIES.map((option) => (
                    <RadioOption
                      key={option.id}
                      active={digest === option.id}
                      onClick={() => setDigest(option.id)}
                      className={`px-2 py-1 rounded-md text-[11.5px] font-medium border border-ink/12 ${
                        digest === option.id ? "text-ink" : "text-ink-soft"
                      }`}
                    >
                      <span>{option.label}</span>
                    </RadioOption>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Personalised paper recommendations
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Based on your saved papers &amp; search history
                </div>
              </div>
              <Toggle defaultOn label="Personalised paper recommendations" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  New practice-changing flags
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  When a paper is graded &quot;Practice-changing&quot; in your
                  specialty
                </div>
              </div>
              <Toggle defaultOn label="New practice-changing flags" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  CME credit milestones
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  Sent at 25%, 50%, 75%, 100% of yearly goal
                </div>
              </div>
              <Toggle defaultOn label="CME credit milestones" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">
                  Account &amp; security alerts
                </div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  New device sign-ins, password changes
                </div>
              </div>
              <Toggle defaultOn label="Account & security alerts" />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[12.5px] font-medium text-ink">Product news</div>
                <div className="text-[10.5px] text-ink/55 mt-0.5">
                  New features, agent upgrades, methodology changes
                </div>
              </div>
              <Toggle label="Product news" />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
