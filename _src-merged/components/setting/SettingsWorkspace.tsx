import SettingsBreadcrumb from "./SettingsBreadcrumb";
import SettingsPageHeader from "./SettingsPageHeader";
import SettingsSidebarNav from "./SettingsSidebarNav";
import SubscriptionSection from "./sections/SubscriptionSection";
import CmeSection from "./sections/CmeSection";
import PreferencesSection from "./sections/PreferencesSection";
import SecuritySection from "./sections/SecuritySection";
import AccountSection from "./sections/AccountSection";
import NextStepCta from "./NextStepCta";

export default function SettingsWorkspace() {
  return (
    <>
      <SettingsBreadcrumb section="Settings" />

      <main className="relative max-w-[1280px] mx-auto px-6 py-10 lg:py-14">
        <SettingsPageHeader
          initials="KE"
          name="K. El-Sherif, MD"
          meta="CARDIOLOGY · #EG-29384"
        />

        <div className="grid grid-cols-12 gap-6 lg:gap-8">
          <SettingsSidebarNav />

          <section className="col-span-12 md:col-span-9 lg:col-span-9 space-y-10">
            <SubscriptionSection />
            <CmeSection />
            <PreferencesSection />
            <SecuritySection />
            <AccountSection />
          </section>
        </div>

        <NextStepCta
          href="/library"
          title="Open your Saved Library"
          meta="1,204 papers · 47 collections"
        />
      </main>
    </>
  );
}
