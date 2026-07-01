import { Paper } from './types';

export const papers: Paper[] = [
  {
    slug: 'semaglutide-cardiovascular-outcomes',
    journal: 'NEJM',
    citation: '2024;391:106-116',
    doi: '10.1056/NEJMoa2403180',
    centers: 14,
    authors: 41,
    title: 'Once-Weekly Semaglutide and Cardiovascular Outcomes in Adults with Overweight or Obesity',
    authorList:
      'Lepault R, Aroda VR, Davies M, de la Sierra A, Erdur EK, ... \u00b7 for the STEP-HFpEF Trial Investigators',
    validated: true,
    reviewer: {
      name: 'K. El-Sherif, MD',
      specialty: 'Consultant Cardiologist',
      institution: 'Ain Shams',
      years: 14,
      papers: 847,
      score: '4.9',
      member: 'FACC',
    },
    stats: {
      hr: '0.79',
      ci: '0.72 \u2013 0.87',
      pValue: '< 0.001',
      grade: 'A',
    },
    tldr: {
      summary:
        'In adults with overweight or obesity and established cardiovascular disease, weekly subcutaneous semaglutide reduced the composite of cardiovascular death, nonfatal MI, and stroke by 21% \u2014 a benefit consistent across pre-specified subgroups and durable over 48 months of follow-up.',
      picot: {
        population:
          'n = 17,604 adults (\u226545 yrs), BMI \u2265 27, with established ASCVD. 41% female, 84% with prior MI, 31% with prior stroke.',
        intervention:
          'Subcutaneous semaglutide 2.4 mg weekly, titrated over 16 weeks. Standard dietary counselling at each visit.',
        comparator:
          'Matching placebo, volume-matched weekly SC injection. Identical injection device and titration schedule.',
        outcome:
          'Primary composite: cardiovascular death, nonfatal MI, nonfatal stroke \u2014 adjudicated, time-to-first event, 48-month median follow-up.',
      },
      meta: {
        synthesised: '11.8s \u00b7 6 agents',
        sources: '41 cites \u00b7 6 figs',
        validatedBy: 'K. El-Sherif, MD',
        cme: '0.5 hrs \u00b7 Card',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P \u00b7 POPULATION', sublabel: '17,604 adults', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O \u00b7 RESULTS', sublabel: 'HR 0.79 (0.72\u20130.87)', x: 650, y: 102, w: 160, h: 56 },
        { id: 'subgroups', label: 'S \u00b7 SUBGROUPS', sublabel: 'Consistent across', x: 20, y: 282, w: 160, h: 56 },
        { id: 'safety', label: 'SAFETY', sublabel: 'GI events 38%', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L \u00b7 LIMITATION', sublabel: '8% discontinued', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'followup', label: 'FOLLOW-UP', sublabel: '48 months', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE \u00b7 RESULTS \u00b7 \u00a73.2',
        quote:
          '"The primary outcome occurred in 6.5% of patients in the semaglutide group and 8.1% of those in the placebo group (hazard ratio, 0.79; 95% confidence interval, 0.72 to 0.87; P<0.001), consistent across all pre-specified subgroups including age, sex, baseline BMI, and diabetes status."',
        cite: 'NEJM \u00b7 2024;391:106-116 \u00b7 p.108, \u00b62',
      },
    },
    infographic: {
      headline: 'Semaglutide cut\ncardiovascular events\nby 21%',
      placeboRate: 'PLACEBO 8.1%',
      semaRate: 'SEMA 6.5%',
      reduction: '\u201321%',
      footer:
        'DOUBLE-BLIND \u00b7 RANDOMISED \u00b7 PLACEBO-CONTROLLED \u00b7 41 SITES \u00b7 5 CONTINENTS\nREVIEWED BY K. EL-SHERIF, MD \u00b7 CARDIOLOGY \u00b7 CC-BY CLARITAS',
    },
    appraisal: {
      score: 8.5,
      domains: [
        { name: 'RANDOMISATION', score: 9.2, rob: 'LOW RoB', color: 'teal' },
        { name: 'ALLOCATION', score: 9.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'BLINDING', score: 7.5, rob: 'SOME RoB', color: 'amber' },
        { name: 'OUTCOMES', score: 9.0, rob: 'LOW RoB', color: 'teal' },
      ],
      biasFlags: [
        {
          title: 'Performance bias \u00b7 open-label extension',
          severity: 'MEDIUM',
          description:
            '8% of patients discontinued treatment during titration; outcome assessors remained blinded, but patients were not.',
          raised: true,
        },
        {
          title: 'Industry funding',
          severity: 'LOW',
          description:
            'Trial funded by Novo Nordisk; 7 of 14 authors report consultant relationships. Independent statistical reanalysis requested.',
          raised: true,
        },
        {
          title: 'Selection bias',
          severity: 'CLEARED',
          description:
            'Adequate randomisation sequence generation; allocation concealment via central IVRS.',
          raised: false,
        },
      ],
      limitations: [
        'Generalisability \u2014 population skewed toward established ASCVD; effects in primary prevention remain unmeasured.',
        'Open-label extension \u2014 8% of participants discontinued; intention-to-treat retained but power reduced.',
        'Median follow-up 48 months \u2014 long-term durability beyond 5 years not yet reported.',
      ],
    },
    relevance: {
      signal: 'SIGNAL \u00b7 CLINICAL PRACTICE',
      summary:
        'For adults with overweight or obesity and established ASCVD already meeting criteria for GLP-1 RA therapy, semaglutide 2.4 mg weekly should be added to standard cardiovascular risk reduction regardless of glycaemic status.',
      confidence: 'CONFIDENCE \u00b7 87%',
      specialties: ['Cardiology', 'Endocrinology', 'Preventive medicine', 'Internal medicine'],
      evidenceGrade: 'A',
      evidenceDescription:
        'High quality \u2014 Further research is unlikely to change confidence in the estimate of effect.',
      practicePoints: [
        {
          title: 'Add to standard secondary prevention',
          description:
            'Patients with BMI \u2265 27 and established ASCVD warrant discussion of semaglutide 2.4 mg weekly alongside statin and antiplatelet therapy.',
          type: 'positive',
        },
        {
          title: 'Counsel on GI tolerability',
          description:
            '~38% will experience GI events; titration over 16 weeks reduces discontinuation. Reassess at 12 weeks.',
          type: 'positive',
        },
        {
          title: 'Not yet primary prevention',
          description:
            'Trial population had established ASCVD. Effects in primary prevention await SELECT-2 (ongoing, n\u22489,000).',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.106' },
      { id: '2', label: 'Methods', range: 'p.107' },
      { id: '3', label: 'Results', range: 'p.108' },
      { id: '4', label: 'Discussion', range: 'p.112' },
      { id: '5', label: 'References', range: 'p.114' },
    ],
    excerpt:
      '"The primary outcome occurred in 6.5% of patients in the semaglutide group and 8.1% of those in the placebo group (hazard ratio, 0.79; 95% CI, 0.72 to 0.87; P<0.001)\u2026"',
    citations: {
      AMA: 'Lepault R, Aroda VR, Davies M, et al. Once-weekly semaglutide and cardiovascular outcomes in adults with overweight or obesity. N Engl J Med. 2024;391:106-116.',
      Vancouver:
        'Lepault R, Aroda VR, Davies M, et al. Once-weekly semaglutide and cardiovascular outcomes in adults with overweight or obesity. N Engl J Med. 2024;391:106-116.',
      APA: 'Lepault, R., Aroda, V. R., Davies, M., et al. (2024). Once-weekly semaglutide and cardiovascular outcomes in adults with overweight or obesity. New England Journal of Medicine, 391, 106-116.',
      Harvard:
        "Lepault, R. et al. (2024) 'Once-weekly semaglutide and cardiovascular outcomes in adults with overweight or obesity', New England Journal of Medicine, 391, pp. 106-116.",
      RIS: 'TY - JOUR \u00b7 AU - Lepault,R \u00b7 TI - Once-weekly semaglutide and cardiovascular outcomes \u00b7 JO - NEJM \u00b7 DA - 2024 \u00b7 VL - 391 \u00b7 SP - 106 \u00b7 EP - 116',
      BibTeX:
        'article{lepault2024semaglutide, title={Once-weekly semaglutide and cardiovascular outcomes in adults with overweight or obesity}, author={Lepault, R. and Aroda, V. R. and Davies, M. and others}, journal={NEJM}, volume={391}, pages={106--116}, year={2024}}',
    },
  },
];

export function getPaperBySlug(slug: string): Paper | undefined {
  return papers.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return papers.map((p) => p.slug);
}
