import type { Metadata } from 'next';
import TopUtilityStrip from '../../../components/site/TopUtilityStrip';
import SiteHeader from '../../../components/site/SiteHeader';
import SiteFooter from '../../../components/site/SiteFooter';
import PaperDetailView from '../../../components/paper/PaperDetailView';
import type { FullText, Paper } from '../../../lib/papers/types';

export const metadata: Metadata = {
  title: 'Paper detail mockup',
  description: 'Illustrative CiteRounds paper detail view for UI review.',
  robots: { index: false, follow: false },
};

const mockPaper: Paper = {
  id: 'MOCK-CR-001',
  title: 'Home blood-pressure monitoring with pharmacist support in adults with uncontrolled hypertension',
  tldr:
    'In this 12-week pragmatic trial, adults who combined home blood-pressure monitoring with pharmacist support achieved a larger reduction in systolic blood pressure than adults receiving usual primary-care follow-up. The intervention was most useful when participants transmitted readings regularly and had a clear medication review pathway.',
  detailed_summary:
    'Background: Uncontrolled hypertension remains common despite effective medications, partly because clinicians have limited visibility into blood-pressure patterns between visits. Home monitoring paired with asynchronous pharmacist support may help teams adjust treatment sooner.\n\nMethods: This pragmatic, parallel-group trial enrolled 412 adults with treated but uncontrolled hypertension across eight primary-care clinics. Participants were assigned to home blood-pressure monitoring plus pharmacist messaging or usual follow-up for 12 weeks. The primary outcome was change in mean daytime systolic blood pressure measured with a blinded ambulatory monitor.\n\nResults: Mean systolic blood pressure fell by 11.4 mmHg in the monitoring-plus-support group and 5.7 mmHg with usual follow-up, for an adjusted between-group difference of -5.6 mmHg (95% CI -8.1 to -3.1). Medication intensification was more frequent in the intervention group, while serious adverse events were uncommon in both groups.\n\nLimitations: The clinics had established digital workflows and the trial was not blinded. Follow-up was limited to 12 weeks, so the durability of the effect is uncertain.',
  study_type: 'pragmatic trial',
  specialty_tags: ['cardiology', 'primary care', 'digital health'],
  journal: 'Journal of General Internal Medicine',
  doi: '10.0000/citerounds.mock.001',
  author_list: 'Maya Chen, Daniel Okafor, Priya Shah, Elena Rossi, Thomas Nguyen',
  authors_count: 5,
  centers: ['Eight primary-care clinics in one regional health system'],
  centers_count: 8,
  pico_summary: {
    population: 'Adults with treated but uncontrolled hypertension',
    intervention: 'Home BP monitoring plus pharmacist messaging',
    comparator: 'Usual primary-care follow-up',
    outcome: 'Change in daytime systolic blood pressure at 12 weeks',
  },
  key_finding: {
    headline: 'Remote monitoring plus pharmacist support lowered systolic blood pressure more than usual follow-up.',
    reduction: '5.6 mmHg greater reduction',
    hr: null,
    ci: '-8.1 to -3.1',
    p_value: 0.001,
    nnt: null,
    n: 412,
  },
  key_findings: {
    signal: 'Moderate evidence: a pragmatic digital-support pathway produced a clinically meaningful additional reduction in systolic blood pressure over 12 weeks.',
    practice_points: [
      'Home readings gave pharmacists earlier signals for medication review.',
      'The effect was strongest among participants who transmitted readings regularly.',
    ],
    findings: [
      {
        claim: 'The intervention group had a 5.6 mmHg greater adjusted reduction in daytime systolic blood pressure.',
        evidence_strength: 'moderate',
        finding_type: 'primary_outcome',
        statistical_support: '95% CI -8.1 to -3.1; p=0.001',
        source_quote: 'The adjusted between-group difference in daytime systolic blood pressure was -5.6 mmHg.',
        limitations_noted: true,
      },
      {
        claim: 'Medication intensification occurred more often with pharmacist support.',
        evidence_strength: 'moderate',
        finding_type: 'clinical_implication',
        statistical_support: 'Directionally consistent across clinics',
        source_quote: 'Treatment changes were recommended sooner in the monitoring arm.',
        limitations_noted: false,
      },
    ],
    overall_evidence_level: 'moderate',
    sample_size: 'N=412',
  },
  mind_map: {
    source: 'Illustrative structured map for the mockup preview.',
    nodes: [
      {
        id: 'root',
        label: 'Remote BP monitoring',
        node_type: 'root',
        children: [
          { id: 'population', label: 'Adults with uncontrolled hypertension', node_type: 'population', children: [] },
          { id: 'intervention', label: 'Home readings + pharmacist messaging', node_type: 'intervention', children: [] },
          { id: 'outcome', label: '-5.6 mmHg adjusted difference', node_type: 'outcome', children: [] },
        ],
      },
    ],
  },
  verification: {
    score: 0.91,
    grade: 'A',
    domains: { numerical: 0.94, factual: 0.89, overall: 0.91 },
    bias_flags: ['The summary does not establish whether the effect persists beyond 12 weeks.'],
    limitations: ['Review the original methods before generalising this pathway to a different clinic setting.'],
    passed: true,
  },
  citation: 'Chen M, Okafor D, Shah P, et al. Home blood-pressure monitoring with pharmacist support in adults with uncontrolled hypertension. Journal of General Internal Medicine. 2026.',
  sections: ['Introduction', 'Methods', 'Results', 'Discussion', 'Limitations'],
  excerpt:
    'Uncontrolled hypertension remains common in primary care. This pragmatic trial tested whether home blood-pressure monitoring paired with asynchronous pharmacist support improved blood pressure over 12 weeks compared with usual follow-up.',
  reviewer: '',
  processing_time: 31.4,
  has_errors: false,
  overall_evidence_level: 'moderate',
  sample_size: 'N=412',
  has_summary: true,
};

const mockFullText: FullText = {
  paper_id: mockPaper.id,
  title: mockPaper.title,
  available: true,
  sections: [
    {
      id: 'introduction',
      title: 'Introduction',
      level: 2,
      content: 'Home blood-pressure monitoring can reveal patterns that are invisible during episodic clinic visits. Pharmacist messaging may turn those readings into faster medication review while preserving primary-care oversight.',
    },
    {
      id: 'methods',
      title: 'Methods',
      level: 2,
      content: 'We enrolled 412 adults with treated but uncontrolled hypertension across eight primary-care clinics. Participants were assigned to home blood-pressure monitoring plus pharmacist messaging or usual follow-up for 12 weeks. The primary outcome was change in mean daytime systolic blood pressure measured with a blinded ambulatory monitor.\n\n- Pragmatic, parallel-group design\n- Eight primary-care clinics\n- 12-week follow-up',
    },
    {
      id: 'results',
      title: 'Results',
      level: 2,
      content: 'Mean systolic blood pressure fell by 11.4 mmHg in the monitoring-plus-support group and 5.7 mmHg with usual follow-up. The adjusted between-group difference was -5.6 mmHg (95% CI -8.1 to -3.1; p=0.001).',
    },
    {
      id: 'discussion',
      title: 'Discussion',
      level: 2,
      content: 'A lightweight monitoring and messaging pathway may help primary-care teams respond to uncontrolled blood pressure between visits. The result is most applicable to clinics with established digital workflows.',
    },
    {
      id: 'limitations',
      title: 'Limitations',
      level: 2,
      content: 'The clinics had established digital workflows, the trial was not blinded, and follow-up was limited to 12 weeks. Durability and implementation costs require further study.',
    },
  ],
};

export default function PaperMockupPage() {
  return (
    <>
      <TopUtilityStrip />
      <SiteHeader />
      <PaperDetailView
        paper={mockPaper}
        fullText={mockFullText}
        mockupNotice="UI mockup only. This illustrative paper and its evidence values are fictional and are not sourced from a real study."
      />
      <SiteFooter />
    </>
  );
}
