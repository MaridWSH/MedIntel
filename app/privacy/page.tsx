import type { Metadata } from 'next';
import SiteFooter from '@/components/site/SiteFooter';
import SiteHeader from '@/components/site/SiteHeader';
import TopUtilityStrip from '@/components/site/TopUtilityStrip';

export const metadata: Metadata = {
  title: 'Privacy Notice · Claritas',
  description: 'Privacy information for the Claritas closed beta.',
};

const sections = [
  ['Data we collect', 'Account registration stores your name, email address, an Argon2 password hash, account timestamps, and the paper identifiers you save. The service may also process security and operational logs such as request time, network address, endpoint, and error information. It does not currently collect payment details.'],
  ['How data is used', 'We use account data to authenticate you, provide saved-paper features, recover access, protect the service, diagnose failures, and understand aggregate beta reliability. Do not submit patient-identifiable, special-category, or confidential clinical data.'],
  ['AI and search', 'The paper-synthesis pipeline processes public research articles, not account content. Search queries are embedded by the MedIntel search service for retrieval; the current application does not intentionally use account search queries to train a generative model.'],
  ['Service providers', 'Infrastructure, database, email-delivery, and model-routing providers may process data on the operator’s behalf. Production deployment should document the selected providers, locations, safeguards, and retention settings before admitting external beta users.'],
  ['Retention and deletion', 'Account data is retained while the beta account is active and as needed for security or legal obligations. You can permanently delete your account and saved-paper library from the account page. Operational backups and security logs may expire on separate schedules.'],
  ['Your choices', 'You may avoid optional use, sign out, or delete your account. Depending on your location, you may also have rights to access, correct, restrict, object to, or export personal data. The operator must publish a monitored privacy contact before opening the beta beyond invited testers.'],
  ['Security', 'Passwords are hashed and browser sessions use HttpOnly cookies. Production requires HTTPS and unique secrets. No system is completely secure, and the beta does not claim HIPAA, ISO 27001, SOC 2, or similar certification.'],
];

export default function PrivacyPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <main className="max-w-[860px] mx-auto px-6 py-12 md:py-16">
        <div className="mono-stat text-teal-deep mb-3">PRIVACY NOTICE · 14 JULY 2026</div>
        <h1 className="display text-[44px] md:text-[60px] mb-5">Minimal data for a focused beta.</h1>
        <p className="serif-body text-[17px] text-ink-soft leading-[1.6] mb-10">
          This notice describes the data handled by the current Claritas beta implementation.
        </p>
        <div className="space-y-8">
          {sections.map(([title, body]) => (
            <section key={title}>
              <h2 className="serif text-[24px] mb-2">{title}</h2>
              <p className="text-[14px] text-ink-soft leading-[1.7]">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
