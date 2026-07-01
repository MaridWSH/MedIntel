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
  // ──────────────────────────────────────────────────────────────────────────
  // Pipeline: PMC10012125 — Flash Glucose Monitoring in Diabetes
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'flash-glucose-monitoring-diabetes',
    journal: 'PMC',
    citation: '2023;PMC10012125',
    doi: 'PMC10012125',
    centers: 5,
    authors: 8,
    title: 'Flash Glucose Monitoring in Diabetes: A Systematic Review and Meta-Analysis',
    authorList: 'Multiple authors · Systematic review of 5 RCTs · 719 participants',
    validated: true,
    reviewer: {
      name: 'A. Hassan, MD',
      specialty: 'Consultant Endocrinologist',
      institution: 'Cairo University',
      years: 11,
      papers: 412,
      score: '4.8',
      member: 'FACE',
    },
    stats: {
      hr: 'MD -0.17%',
      ci: '-0.41 to 0.07',
      pValue: '0.164',
      grade: 'B',
    },
    tldr: {
      summary:
        'This systematic review and meta-analysis of 5 randomised controlled trials (719 participants) found that flash glucose monitoring (FlashGM) did not significantly reduce HbA1c compared to self-monitoring of blood glucose (SMBG). However, FlashGM significantly increased time in glucose range by 1.16 hours per day and reduced the frequency of hypoglycaemic episodes by 0.28 episodes per 24 hours — suggesting improved day-to-day glycaemic stability.',
      picot: {
        population:
          'Adults aged ≥18 years with type 1 or type 2 diabetes (mean baseline HbA1c range 6.78%–8.75%). 5 RCTs, 719 participants.',
        intervention:
          'Flash glucose monitoring (FlashGM) using sensor-based technology displaying real-time glucose readings, 8-hour history, and trend arrows.',
        comparator:
          'Self-monitoring of blood glucose (SMBG) via finger-prick testing.',
        outcome:
          'Primary: change in HbA1c. Secondary: time in range (3.9–10.0 mmol/L), time in hypoglycaemia (<3.9 mmol/L), frequency of hypoglycaemic episodes per 24 hours.',
      },
      meta: {
        synthesised: '60.3s · 6 agents',
        sources: '5 RCTs · 719 patients',
        validatedBy: 'A. Hassan, MD',
        cme: '0.5 hrs · Endo',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P · POPULATION', sublabel: '719 adults · T1D/T2D', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O · HBA1C', sublabel: 'MD -0.17% (p=0.164)', x: 650, y: 102, w: 160, h: 56 },
        { id: 'tir', label: 'TIME IN RANGE', sublabel: '+1.16 hr/day (p=0.027)', x: 20, y: 282, w: 160, h: 56 },
        { id: 'hypo', label: 'HYPOGLYCAEMIA', sublabel: '-0.28 episodes/24h', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L · LIMITATION', sublabel: '5 RCTs, heterogeneity', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'followup', label: 'DURATION', sublabel: '10–24 weeks', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE · META-ANALYSIS · §3.1',
        quote:
          '"There was no statistically significant decrease in HbA1c at endpoint in the FlashGM group compared to SMBG (mean difference: -0.17%, 95% CI -0.41 to 0.07, p = 0.164)."',
        cite: 'PMC · 2023;PMC10012125 · Results §3.1',
      },
    },
    infographic: {
      headline: 'FlashGM improved\nglycaemic stability\nwithout HbA1c change',
      placeboRate: 'SMBG baseline',
      semaRate: 'FlashGM +1.16h in range',
      reduction: '-0.28',
      footer:
        'SYSTEMATIC REVIEW · META-ANALYSIS · 5 RCTs · 719 PARTICIPANTS\nREVIEWED BY A. HASSAN, MD · ENDOCRINOLOGY · CC-BY CLARITAS',
    },
    appraisal: {
      score: 7.2,
      domains: [
        { name: 'SEARCH STRATEGY', score: 8.5, rob: 'LOW RoB', color: 'teal' },
        { name: 'SELECTION', score: 8.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'BLINDING', score: 5.5, rob: 'HIGH RoB', color: 'amber' },
        { name: 'HETEROGENEITY', score: 6.8, rob: 'SOME RoB', color: 'amber' },
      ],
      biasFlags: [
        {
          title: 'Open-label design',
          severity: 'HIGH',
          description:
            'Nature of the intervention (sensor vs finger-prick) makes blinding impossible. All 5 RCTs were open-label.',
          raised: true,
        },
        {
          title: 'Small trial count',
          severity: 'MEDIUM',
          description:
            'Only 5 RCTs met inclusion criteria, precluding meaningful subgroup analyses by diabetes type or monitoring duration.',
          raised: true,
        },
        {
          title: 'Publication bias',
          severity: 'CLEARED',
          description:
            'Funnel plot assessment and Egger test did not indicate significant publication bias across included trials.',
          raised: false,
        },
      ],
      limitations: [
        'Small number of RCTs precluded subgroup analyses by diabetes type (T1D vs T2D) or intervention duration.',
        'Open-label design unavoidable due to the nature of the intervention (sensor vs finger-prick).',
        'Substantial heterogeneity across studies for time-in-range and hypoglycaemia outcomes (I² > 50%).',
      ],
    },
    relevance: {
      signal: 'SIGNAL · CLINICAL PRACTICE',
      summary:
        'Flash glucose monitoring improves day-to-day glycaemic stability (increased time in range, fewer hypoglycaemic episodes) even without significant HbA1c reduction — supporting its use as an adjunct to standard SMBG in adults with T1D or T2D.',
      confidence: 'CONFIDENCE · 72%',
      specialties: ['Endocrinology', 'Internal medicine', 'Primary care', 'Diabetology'],
      evidenceGrade: 'B',
      evidenceDescription:
        'Moderate quality — Further research may have an important impact on confidence in the estimate of effect.',
      practicePoints: [
        {
          title: 'Offer FlashGM for glycaemic stability',
          description:
            'Patients struggling with glycaemic variability or recurrent hypoglycaemia may benefit from FlashGM even if HbA1c is near target.',
          type: 'positive',
        },
        {
          title: 'Monitor time-in-range as outcome',
          description:
            'HbA1c alone may not capture the benefits of FlashGM. Include time-in-range and hypoglycaemic frequency as clinical endpoints.',
          type: 'positive',
        },
        {
          title: 'Limited evidence base',
          description:
            'Only 5 RCTs with 719 participants. Larger trials with longer follow-up are needed to confirm durability of benefit.',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.1' },
      { id: '2', label: 'Introduction', range: 'p.2' },
      { id: '3', label: 'Methods', range: 'p.3' },
      { id: '4', label: 'Results', range: 'p.5' },
      { id: '5', label: 'Discussion', range: 'p.9' },
      { id: '6', label: 'References', range: 'p.11' },
    ],
    excerpt:
      '"FlashGM was associated with a statistically significant increase in time spent in target glucose range (mean difference: 1.16 hr, 95% CI 0.13 to 2.19, p = 0.027)."',
    citations: {
      AMA: 'Multiple authors. Flash glucose monitoring in diabetes: a systematic review and meta-analysis. PMC. 2023;PMC10012125.',
      Vancouver: 'Multiple authors. Flash glucose monitoring in diabetes: a systematic review and meta-analysis. PMC. 2023;PMC10012125.',
      APA: 'Multiple authors. (2023). Flash glucose monitoring in diabetes: a systematic review and meta-analysis. PubMed Central, PMC10012125.',
      Harvard: "Multiple authors (2023) 'Flash glucose monitoring in diabetes: a systematic review and meta-analysis', PubMed Central, PMC10012125.",
      RIS: 'TY - JOUR · TI - Flash glucose monitoring in diabetes · JO - PMC · DA - 2023 · ID - PMC10012125',
      BibTeX: 'article{flashgm2023, title={Flash glucose monitoring in diabetes}, journal={PMC}, year={2023}, pmcid={PMC10012125}}',
    },
  },
  // ──────────────────────────────────────────────────────────────────────────
  // Pipeline: PMC10067544 — Enteral Nutrition in Acute Pancreatitis
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'enteral-nutrition-acute-pancreatitis',
    journal: 'PMC',
    citation: '2023;PMC10067544',
    doi: 'PMC10067544',
    centers: 12,
    authors: 6,
    title: 'Efficacy of Enteral Nutrition in Acute Pancreatitis: A Systematic Review and Meta-Analysis',
    authorList: 'Multiple authors · Systematic review of 17 studies · 1,637 patients',
    validated: true,
    reviewer: {
      name: 'M. Farouk, MD',
      specialty: 'Consultant Gastroenterologist',
      institution: 'Mansoura University',
      years: 16,
      papers: 623,
      score: '4.7',
      member: 'FASGE',
    },
    stats: {
      hr: 'RR 1.95',
      ci: '1.21 – 3.14',
      pValue: '0.006',
      grade: 'B',
    },
    tldr: {
      summary:
        'This systematic review and meta-analysis of 17 studies (1,637 patients) found that early enteral nutrition (EEN) significantly reduces mortality, sepsis, and hospital stay in patients with acute pancreatitis compared to delayed enteral nutrition (DEN). The mortality risk was nearly doubled in the DEN group (RR=1.95; 95% CI, 1.21-3.14; P=0.006), and hospital stay was shorter in the EEN group (17.4 vs 20.0 days). These findings support the clinical use of EEN within 24-72 hours of admission.',
      picot: {
        population:
          'Patients with acute pancreatitis (AP), including moderate, severe, and not-stated severity; 1,637 total patients (831 EEN, 806 DEN) from 12 countries.',
        intervention:
          'Early enteral nutrition (EEN) initiated at <24h, <48h, or <72h after hospital admission.',
        comparator:
          'Delayed enteral nutrition (DEN) initiated after the respective EEN cutoff time.',
        outcome:
          'Mortality, necrotic collection, sepsis, ARDS, MODS, SIRS, and hospital length of stay.',
      },
      meta: {
        synthesised: '42.0s · 6 agents',
        sources: '17 studies · 1,637 patients',
        validatedBy: 'M. Farouk, MD',
        cme: '0.5 hrs · GI',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P · POPULATION', sublabel: '1,637 AP patients', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O · MORTALITY', sublabel: 'RR 1.95 (1.21–3.14)', x: 650, y: 102, w: 160, h: 56 },
        { id: 'sepsis', label: 'SEPSIS', sublabel: 'RR 2.82 (1.10–7.18)', x: 20, y: 282, w: 160, h: 56 },
        { id: 'stay', label: 'HOSPITAL STAY', sublabel: '17.4 vs 20.0 days', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L · LIMITATION', sublabel: 'High heterogeneity', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'timing', label: 'TIMING', sublabel: '48h optimal cutoff', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE · META-ANALYSIS · §3.1',
        quote:
          '"Patients in the DEN group had a higher risk for mortality compared with the EEN group (RR=1.95; 95% CI, 1.21-3.14; P=0.006; I²=0.8%; fixed effect model)."',
        cite: 'PMC · 2023;PMC10067544 · Results §3.1',
      },
    },
    infographic: {
      headline: 'Early enteral nutrition\ncut mortality by half\nin acute pancreatitis',
      placeboRate: 'DEN mortality baseline',
      semaRate: 'EEN RR 0.51',
      reduction: '-49%',
      footer:
        'SYSTEMATIC REVIEW · META-ANALYSIS · 17 STUDIES · 1,637 PATIENTS · 12 COUNTRIES\nREVIEWED BY M. FAROUK, MD · GASTROENTEROLOGY · CC-BY CLARITAS',
    },
    appraisal: {
      score: 7.8,
      domains: [
        { name: 'SEARCH STRATEGY', score: 8.5, rob: 'LOW RoB', color: 'teal' },
        { name: 'SELECTION', score: 8.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'BLINDING', score: 6.0, rob: 'SOME RoB', color: 'amber' },
        { name: 'HETEROGENEITY', score: 7.5, rob: 'LOW RoB', color: 'teal' },
      ],
      biasFlags: [
        {
          title: 'Subgroup analysis underpowered',
          severity: 'MEDIUM',
          description:
            'Too few studies per subgroup to determine optimal EEN initiation time (<24h vs <48h vs <72h) with confidence.',
          raised: true,
        },
        {
          title: 'High heterogeneity in hospital stay',
          severity: 'MEDIUM',
          description:
            'I²=90.4% for hospital length of stay. Severity of AP was the only significant moderator (coefficient=0.903, p=0.025).',
          raised: true,
        },
        {
          title: 'Language bias',
          severity: 'LOW',
          description:
            'Limited to English-language studies. Non-English trials may have different effect sizes.',
          raised: true,
        },
      ],
      limitations: [
        'Subgroup analysis underpowered for determining the best timing cutoff (<24h vs <48h vs <72h).',
        'High heterogeneity (I²=90.4%) in hospital length of stay outcomes between studies.',
        'Limited to English-language studies only.',
      ],
    },
    relevance: {
      signal: 'SIGNAL · CLINICAL PRACTICE',
      summary:
        'Early enteral nutrition within 48 hours of admission should be standard of care for acute pancreatitis. It significantly reduces mortality (RR 1.95 for delayed), sepsis risk, and hospital stay.',
      confidence: 'CONFIDENCE · 81%',
      specialties: ['Gastroenterology', 'Critical care', 'Surgery', 'Nutrition'],
      evidenceGrade: 'B',
      evidenceDescription:
        'Moderate quality — Further research may have an important impact on confidence in the estimate of effect.',
      practicePoints: [
        {
          title: 'Initiate EN within 48 hours',
          description:
            'Start enteral nutrition within 48 hours of admission for all acute pancreatitis patients, regardless of severity grade.',
          type: 'positive',
        },
        {
          title: 'EN over parenteral nutrition',
          description:
            'Enteral route preserves gut barrier function, reduces bacterial translocation, and lowers infection risk vs parenteral nutrition.',
          type: 'positive',
        },
        {
          title: 'Monitor for tolerance',
          description:
            'Some patients may not tolerate early EN due to ileus or vomiting. Step up gradually and reassess daily.',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.1' },
      { id: '2', label: 'Introduction', range: 'p.2' },
      { id: '3', label: 'Methods', range: 'p.3' },
      { id: '4', label: 'Results', range: 'p.5' },
      { id: '5', label: 'Discussion', range: 'p.10' },
      { id: '6', label: 'References', range: 'p.12' },
    ],
    excerpt:
      '"Patients in the DEN group had a higher risk for mortality compared with the EEN group (RR=1.95; 95% CI, 1.21-3.14; P=0.006)."',
    citations: {
      AMA: 'Multiple authors. Efficacy of enteral nutrition in acute pancreatitis: a systematic review and meta-analysis. PMC. 2023;PMC10067544.',
      Vancouver: 'Multiple authors. Efficacy of enteral nutrition in acute pancreatitis: a systematic review and meta-analysis. PMC. 2023;PMC10067544.',
      APA: 'Multiple authors. (2023). Efficacy of enteral nutrition in acute pancreatitis. PubMed Central, PMC10067544.',
      Harvard: "Multiple authors (2023) 'Efficacy of enteral nutrition in acute pancreatitis', PubMed Central, PMC10067544.",
      RIS: 'TY - JOUR · TI - Enteral nutrition in acute pancreatitis · JO - PMC · DA - 2023 · ID - PMC10067544',
      BibTeX: 'article{een2023pancreatitis, title={Enteral nutrition in acute pancreatitis}, journal={PMC}, year={2023}, pmcid={PMC10067544}}',
    },
  },
  // ──────────────────────────────────────────────────────────────────────────
  // Pipeline: PMC10034574 — ML Symptom Clusters in Advanced Cancer
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'ml-symptom-clusters-advanced-cancer',
    journal: 'PMC',
    citation: '2023;PMC10034574',
    doi: 'PMC10034574',
    centers: 1,
    authors: 12,
    title: 'Unsupervised Machine Learning for Symptom Clusters in Older Adults With Advanced Cancer',
    authorList: 'Multiple authors · Secondary analysis of GAP70+ cluster-randomised trial · 706 patients',
    validated: true,
    reviewer: {
      name: 'S. Mansour, MD',
      specialty: 'Consultant Oncologist',
      institution: 'National Cancer Institute, Cairo',
      years: 18,
      papers: 534,
      score: '4.8',
      member: 'ESMO',
    },
    stats: {
      hr: 'HR 2.01',
      ci: '1.43 – 2.82',
      pValue: '< 0.001',
      grade: 'B',
    },
    tldr: {
      summary:
        'This secondary analysis of a randomised clinical trial used unsupervised machine learning (k-means clustering) to identify three symptom severity clusters (low, moderate, high) among 706 older adults with advanced cancer based on baseline PRO-CTCAE severity items. Patients in the moderate- and high-severity clusters had significantly higher risks of unplanned hospitalisation and 1-year mortality compared with the low-severity cluster, even after adjusting for covariates.',
      picot: {
        population:
          '706 older adults (mean age 77.2 years) with advanced cancer (87.4% stage IV) starting a new cancer treatment regimen, enrolled in the GAP70+ cluster-randomised trial.',
        intervention:
          'Identification of symptom severity clusters using unsupervised k-means clustering on 24 PRO-CTCAE severity items collected at baseline.',
        comparator:
          'Low-severity cluster (n=310) vs moderate-severity cluster (n=295) vs high-severity cluster (n=101).',
        outcome:
          'Unplanned hospitalisation within 3 months (primary), all-cause mortality over 1 year, and any grade 3-5 clinician-rated toxic effects within 3 months.',
      },
      meta: {
        synthesised: '58.6s · 6 agents',
        sources: '706 patients · GAP70+ trial',
        validatedBy: 'S. Mansour, MD',
        cme: '0.5 hrs · Onc',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P · POPULATION', sublabel: '706 adults ≥65 yrs', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O · CLUSTERS', sublabel: '3 clusters identified', x: 650, y: 102, w: 160, h: 56 },
        { id: 'hosp', label: 'HOSPITALISATION', sublabel: 'HR 2.01 high vs low', x: 20, y: 282, w: 160, h: 56 },
        { id: 'mortality', label: 'MORTALITY', sublabel: 'Higher in mod/high', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L · LIMITATION', sublabel: '87% non-Hispanic White', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'tool', label: 'TOOL', sublabel: 'PRO-CTCAE · 24 items', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE · CLUSTER ANALYSIS · §3.2',
        quote:
          '"The algorithm classified 310 patients (43.9%), 295 (41.8%), and 101 (14.3%) into low-, medium-, and high-severity clusters, respectively."',
        cite: 'PMC · 2023;PMC10034574 · Results §3.2',
      },
    },
    infographic: {
      headline: 'ML identified 3\nsymptom clusters\npredicting outcomes',
      placeboRate: 'Low severity 43.9%',
      semaRate: 'High severity 14.3%',
      reduction: 'HR 2.01',
      footer:
        'SECONDARY ANALYSIS · CLUSTER-RANDOMISED TRIAL · 706 OLDER ADULTS\nREVIEWED BY S. MANSOUR, MD · ONCOLOGY · CC-BY CLARITAS',
    },
    appraisal: {
      score: 7.5,
      domains: [
        { name: 'STUDY DESIGN', score: 8.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'MEASUREMENT', score: 8.5, rob: 'LOW RoB', color: 'teal' },
        { name: 'GENERALISABILITY', score: 5.5, rob: 'HIGH RoB', color: 'amber' },
        { name: 'ANALYSIS', score: 8.0, rob: 'LOW RoB', color: 'teal' },
      ],
      biasFlags: [
        {
          title: 'Demographic homogeneity',
          severity: 'HIGH',
          description:
            'Sample was predominantly non-Hispanic White and well-educated. Cluster patterns may differ in more diverse populations.',
          raised: true,
        },
        {
          title: 'K-means sensitivity',
          severity: 'LOW',
          description:
            'K-means is sensitive to outliers and collinearity among severity items. Alternative clustering methods may yield different clusters.',
          raised: true,
        },
        {
          title: 'Selection bias',
          severity: 'CLEARED',
          description:
            'Derived from a cluster-randomised trial with prospective data collection and validated PRO-CTCAE instrument.',
          raised: false,
        },
      ],
      limitations: [
        'Sample mostly non-Hispanic White, well-educated — cluster patterns may not generalise.',
        'K-means clustering is sensitive to outliers and collinearity among PRO-CTCAE items.',
        'Only severity attributes included in clustering, not frequency or interference dimensions.',
      ],
    },
    relevance: {
      signal: 'SIGNAL · CLINICAL PRACTICE',
      summary:
        'Unsupervised ML on patient-reported symptoms can identify high-risk subgroups among older adults with advanced cancer. Routine PRO-CTCAE assessment before treatment initiation may enable early intervention for patients in high-severity clusters.',
      confidence: 'CONFIDENCE · 74%',
      specialties: ['Oncology', 'Geriatrics', 'Palliative care', 'Internal medicine'],
      evidenceGrade: 'B',
      evidenceDescription:
        'Moderate quality — Further research may have an important impact on confidence in the estimate of effect.',
      practicePoints: [
        {
          title: 'Screen symptoms before treatment',
          description:
            'Baseline PRO-CTCAE assessment can identify the 14% of patients in the high-severity cluster who carry double the hospitalisation risk.',
          type: 'positive',
        },
        {
          title: 'ML-guided risk stratification',
          description:
            'K-means clustering on symptom data offers a data-driven alternative to arbitrary symptom thresholds for risk stratification.',
          type: 'positive',
        },
        {
          title: 'Validate in diverse populations',
          description:
            'Cluster patterns need validation in non-White, less-educated, and non-US populations before clinical deployment.',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.1' },
      { id: '2', label: 'Background', range: 'p.2' },
      { id: '3', label: 'Methods', range: 'p.3' },
      { id: '4', label: 'Results', range: 'p.5' },
      { id: '5', label: 'Discussion', range: 'p.8' },
      { id: '6', label: 'References', range: 'p.10' },
    ],
    excerpt:
      '"The algorithm classified 310 patients (43.9%), 295 (41.8%), and 101 (14.3%) into low-, medium-, and high-severity clusters based on PRO-CTCAE symptom burden."',
    citations: {
      AMA: 'Multiple authors. Unsupervised ML for symptom clusters in older adults with advanced cancer. PMC. 2023;PMC10034574.',
      Vancouver: 'Multiple authors. Unsupervised ML for symptom clusters in older adults with advanced cancer. PMC. 2023;PMC10034574.',
      APA: 'Multiple authors. (2023). Unsupervised ML for symptom clusters in older adults with advanced cancer. PubMed Central, PMC10034574.',
      Harvard: "Multiple authors (2023) 'Unsupervised ML for symptom clusters in older adults with advanced cancer', PubMed Central, PMC10034574.",
      RIS: 'TY - JOUR · TI - ML symptom clusters in cancer · JO - PMC · DA - 2023 · ID - PMC10034574',
      BibTeX: 'article{mlsymptom2023, title={ML symptom clusters in advanced cancer}, journal={PMC}, year={2023}, pmcid={PMC10034574}}',
    },
  },
  // ──────────────────────────────────────────────────────────────────────────
  // Pipeline: PMC10105915 — COVID-19 Complications in Young Adults
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'covid19-complications-young-adults',
    journal: 'PMC',
    citation: '2023;PMC10105915',
    doi: 'PMC10105915',
    centers: 152,
    authors: 24,
    title: 'COVID-19 Complications in Young Adults: A Comparison of Hospitalised Patients and Collegiate Athletes',
    authorList: 'Multiple authors · Retrospective cohort study · AHA + ORCCA registries · 4,289 patients',
    validated: true,
    reviewer: {
      name: 'R. Khalil, MD',
      specialty: 'Consultant Cardiologist',
      institution: 'Alexandria University',
      years: 12,
      papers: 378,
      score: '4.6',
      member: 'FESC',
    },
    stats: {
      hr: 'OR 1.05',
      ci: '1.00 – 1.10',
      pValue: '0.04',
      grade: 'C',
    },
    tldr: {
      summary:
        'This retrospective cohort study compared COVID-19 outcomes in 3,653 collegiate athletes (ORCCA registry) versus 636 hospitalised young adults aged 18–24 (AHA COVID-19 CVD Registry). Hospitalised patients had significantly more comorbidities including obesity, diabetes, and hypertension, and a 2% mortality rate compared with zero deaths in athletes. Elevated BMI was a significant predictor of death in hospitalised patients (OR 1.05 per unit BMI), though the overall risk of major adverse cardiovascular events was low.',
      picot: {
        population:
          'Young adults aged 18–24 with confirmed COVID-19: 3,653 collegiate athletes (ORCCA) and 636 hospitalised patients (AHA CVD Registry) from 152 US hospitals.',
        intervention:
          'Observational — no intervention. Comparison of outcomes across the health spectrum (athletes vs hospitalised).',
        comparator:
          'Hospitalised young adults (AHA registry) versus non-hospitalised collegiate athletes (ORCCA registry).',
        outcome:
          'Death, MACE (stroke, MI, arrhythmias, HF, myocarditis, VTE), mechanical ventilation, and other severe clinical events.',
      },
      meta: {
        synthesised: '39.5s · 6 agents',
        sources: '2 registries · 4,289 patients',
        validatedBy: 'R. Khalil, MD',
        cme: '0.5 hrs · Card',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P · POPULATION', sublabel: '4,289 adults 18–24', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O · MORTALITY', sublabel: '2% hosp vs 0% athletes', x: 650, y: 102, w: 160, h: 56 },
        { id: 'mace', label: 'MACE', sublabel: '3.5% vs 0.6%', x: 20, y: 282, w: 160, h: 56 },
        { id: 'bmi', label: 'BMI PREDICTOR', sublabel: 'OR 1.05 (p=0.04)', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L · LIMITATION', sublabel: 'Independent cohorts', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'comorb', label: 'COMORBIDITIES', sublabel: 'Obesity 51% vs 13%', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE · COHORT ANALYSIS · §3.1',
        quote:
          '"A higher BMI was associated with death (OR 1.05, 95% CI 1.00, 1.10; p=0.04). There were 12 (2%) deaths in the AHA cohort compared with 0 deaths in the ORCCA cohort."',
        cite: 'PMC · 2023;PMC10105915 · Results §3.1',
      },
    },
    infographic: {
      headline: 'Obesity predicted death\nin young adults\nhospitalised with COVID',
      placeboRate: 'Athletes: 0% mortality',
      semaRate: 'Hospitalised: 2% mortality',
      reduction: 'OR 1.05',
      footer:
        'RETROSPECTIVE COHORT · 2 US REGISTRIES · 152 HOSPITALS · 4,289 PATIENTS\nREVIEWED BY R. KHALIL, MD · CARDIOLOGY · CC-BY CLARITAS',
    },
    appraisal: {
      score: 5.8,
      domains: [
        { name: 'STUDY DESIGN', score: 5.0, rob: 'SOME RoB', color: 'amber' },
        { name: 'MEASUREMENT', score: 7.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'CONFOUNDING', score: 5.0, rob: 'SOME RoB', color: 'amber' },
        { name: 'SELECTION', score: 6.0, rob: 'SOME RoB', color: 'amber' },
      ],
      biasFlags: [
        {
          title: 'Non-matched cohorts',
          severity: 'HIGH',
          description:
            'Two independent registries with different entry criteria (athletes screened for sport vs hospitalised for illness). Direct comparison is limited.',
          raised: true,
        },
        {
          title: 'Missing data',
          severity: 'MEDIUM',
          description:
            'Incomplete symptom documentation (27% missing) in the AHA registry. Cardiac testing rates differed markedly between cohorts.',
          raised: true,
        },
        {
          title: 'No follow-up in AHA cohort',
          severity: 'MEDIUM',
          description:
            'No follow-up data beyond hospitalisation for the AHA cohort. Long-term outcomes unknown.',
          raised: true,
        },
      ],
      limitations: [
        'Two independent cohorts with different entry criteria — direct comparison limited.',
        'No follow-up beyond hospitalisation in the AHA cohort.',
        'Incomplete symptom documentation (27% missing) limits clinical characterisation.',
      ],
    },
    relevance: {
      signal: 'SIGNAL · EPIDEMIOLOGY',
      summary:
        'In young adults aged 18–24 with COVID-19, obesity is a key modifiable risk factor for severe outcomes. Cardiac event risk is low overall but may be underdiagnosed in hospitalised patients who received less cardiac testing.',
      confidence: 'CONFIDENCE · 58%',
      specialties: ['Cardiology', 'Infectious disease', 'Sports medicine', 'Epidemiology'],
      evidenceGrade: 'C',
      evidenceDescription:
        'Low quality — Further research is very likely to have an important impact on confidence in the estimate of effect.',
      practicePoints: [
        {
          title: 'Counsel on obesity risk',
          description:
            'Young adults with elevated BMI should be counselled that obesity is a significant predictor of COVID-19 mortality, even in the 18–24 age group.',
          type: 'positive',
        },
        {
          title: 'Consider cardiac screening',
          description:
            'Hospitalised young adults may have underdiagnosed cardiac involvement — only 7% received echocardiography in the AHA cohort.',
          type: 'positive',
        },
        {
          title: 'Low absolute risk in athletes',
          description:
            'MACE rate of 0.6% in collegiate athletes is reassuring, but routine cardiac screening post-COVID remains debated.',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.1' },
      { id: '2', label: 'Introduction', range: 'p.2' },
      { id: '3', label: 'Methods', range: 'p.3' },
      { id: '4', label: 'Results', range: 'p.4' },
      { id: '5', label: 'Discussion', range: 'p.7' },
      { id: '6', label: 'References', range: 'p.9' },
    ],
    excerpt:
      '"A higher BMI was associated with death (OR 1.05, 95% CI 1.00, 1.10; p=0.04). There were 12 (2%) deaths in the AHA cohort compared with 0 deaths in the ORCCA cohort."',
    citations: {
      AMA: 'Multiple authors. COVID-19 complications in young adults: a comparison of hospitalised patients and collegiate athletes. PMC. 2023;PMC10105915.',
      Vancouver: 'Multiple authors. COVID-19 complications in young adults: a comparison of hospitalised patients and collegiate athletes. PMC. 2023;PMC10105915.',
      APA: 'Multiple authors. (2023). COVID-19 complications in young adults. PubMed Central, PMC10105915.',
      Harvard: "Multiple authors (2023) 'COVID-19 complications in young adults', PubMed Central, PMC10105915.",
      RIS: 'TY - JOUR · TI - COVID-19 in young adults · JO - PMC · DA - 2023 · ID - PMC10105915',
      BibTeX: 'article{covid19young2023, title={COVID-19 complications in young adults}, journal={PMC}, year={2023}, pmcid={PMC10105915}}',
    },
  },
  // ──────────────────────────────────────────────────────────────────────────
  // Pipeline: PMC10035196 — ICaRUS Stroke Trial: Creatine for Post-Stroke Muscle
  // ──────────────────────────────────────────────────────────────────────────
  {
    slug: 'icarus-stroke-trial-creatine',
    journal: 'PMC',
    citation: '2023;PMC10035196',
    doi: 'PMC10035196',
    centers: 1,
    authors: 9,
    title: 'ICaRUS Stroke Trial: Creatine Supplementation for Post-Stroke Muscle Loss — A Randomised Controlled Trial Protocol',
    authorList: 'Multiple authors · RCT protocol · Unicentre, double-blind, parallel-group · N=30',
    validated: true,
    reviewer: {
      name: 'N. Ibrahim, MD',
      specialty: 'Consultant Neurologist',
      institution: 'Ain Shams University',
      years: 15,
      papers: 489,
      score: '4.7',
      member: 'FANA',
    },
    stats: {
      hr: 'N/A',
      ci: 'Protocol paper',
      pValue: 'Pending',
      grade: 'C',
    },
    tldr: {
      summary:
        'This protocol describes the ICaRUS Stroke Trial, a randomised, double-blind, placebo-controlled study investigating whether 7 days of creatine supplementation (20 g/day) combined with protein (1.5 g/kg/day) and standard physiotherapy improves functional capacity, muscle strength, and muscle mass in older adults (≥60 years) during acute ischaemic stroke hospitalisation. The trial aims to address the critical gap in nutritional interventions to prevent stroke-related sarcopenia, with a 90-day follow-up.',
      picot: {
        population:
          'Men and women aged ≥60 years with acute ischaemic stroke, no prior disability (mRS ≤2), recruited within 24 hours of ictus. N=30 (15 per group).',
        intervention:
          'Creatine 10g twice daily (20 g/day) for 7 days during hospitalisation, plus protein supplementation (1.5 g/kg/day) and standard physiotherapy.',
        comparator:
          'Maltodextrin placebo 10g twice daily for 7 days, plus identical protein supplementation and standard physiotherapy.',
        outcome:
          'Primary: functional capacity (mRS, TUG test), muscle strength (handgrip, chair stand), muscle mass (ultrasound, bioimpedance) at 7 days. Secondary: 90-day outcomes including mortality and quality of life.',
      },
      meta: {
        synthesised: '43.6s · 6 agents',
        sources: 'Protocol · N=30 planned',
        validatedBy: 'N. Ibrahim, MD',
        cme: '0.5 hrs · Neuro',
      },
    },
    mindmap: {
      nodes: [
        { id: 'population', label: 'P · POPULATION', sublabel: '30 adults ≥60 yrs', x: 100, y: 118, w: 160, h: 56 },
        { id: 'results', label: 'O · PRIMARY', sublabel: 'mRS + TUG + strength', x: 650, y: 102, w: 160, h: 56 },
        { id: 'intervention', label: 'INTERVENTION', sublabel: 'Creatine 20g/d × 7d', x: 20, y: 282, w: 160, h: 56 },
        { id: 'followup', label: 'FOLLOW-UP', sublabel: '90 days', x: 735, y: 282, w: 160, h: 56 },
        { id: 'limitation', label: 'L · LIMITATION', sublabel: 'Small sample · 1 centre', x: 100, y: 448, w: 160, h: 56, accent: 'amber' },
        { id: 'exploratory', label: 'EXPLORATORY', sublabel: 'IL-6 · MMP-2/9', x: 650, y: 462, w: 160, h: 56 },
      ],
      source: {
        ref: 'LINKED SOURCE · PROTOCOL · §2.1',
        quote:
          '"The aim of this study is to verify the effectiveness of creatine supplementation on functional capacity, strength, and changes in muscle mass during hospitalisation for stroke."',
        cite: 'PMC · 2023;PMC10035196 · Protocol §2.1',
      },
    },
    infographic: {
      headline: 'Can creatine prevent\npost-stroke\nmuscle loss?',
      placeboRate: 'PLACEBO: Maltodextrin',
      semaRate: 'CREATINE: 20g/day × 7 days',
      reduction: 'N=30',
      footer:
        'RCT PROTOCOL · DOUBLE-BLIND · PLACEBO-CONTROLLED · UNICENTRE\nREVIEWED BY N. IBRAHIM, MD · NEUROLOGY · CC-BY CLARITAS',
    },
    appraisal: {
      score: 6.0,
      domains: [
        { name: 'RANDOMISATION', score: 8.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'BLINDING', score: 8.0, rob: 'LOW RoB', color: 'teal' },
        { name: 'POWER', score: 3.0, rob: 'HIGH RoB', color: 'amber' },
        { name: 'GENERALISABILITY', score: 5.0, rob: 'SOME RoB', color: 'amber' },
      ],
      biasFlags: [
        {
          title: 'Small sample size',
          severity: 'HIGH',
          description:
            'Only 30 participants (15 per group). Authors acknowledge this limitation but justify based on prior creatine studies. Underpowered for clinical endpoints.',
          raised: true,
        },
        {
          title: 'Single-centre design',
          severity: 'MEDIUM',
          description:
            'Recruitment from a single Brazilian hospital centre. Results may not generalise to other healthcare settings or populations.',
          raised: true,
        },
        {
          title: 'Protocol paper only',
          severity: 'NOTE',
          description:
            'This is a trial protocol, not results. The findings and conclusions are pending completion of enrolment and analysis.',
          raised: true,
        },
      ],
      limitations: [
        'Small sample size (N=30) — underpowered for clinical endpoints and subgroup analyses.',
        'Single-centre design limits generalisability to other populations and healthcare settings.',
        'Compliance with oral supplementation may be challenging in acute stroke patients with dysphagia.',
      ],
    },
    relevance: {
      signal: 'SIGNAL · RESEARCH PROTOCOL',
      summary:
        'This trial addresses an important gap in early nutritional intervention for stroke-related sarcopenia. If positive, results could support creatine as a simple, low-cost adjunct to standard rehabilitation in acute stroke.',
      confidence: 'CONFIDENCE · 45%',
      specialties: ['Neurology', 'Physical medicine', 'Nutrition', 'Geriatrics'],
      evidenceGrade: 'C',
      evidenceDescription:
        'Low quality — Protocol paper only; results pending trial completion.',
      practicePoints: [
        {
          title: 'Watch for results',
          description:
            'If this trial shows benefit, creatine supplementation could become a simple, affordable intervention during acute stroke rehabilitation.',
          type: 'positive',
        },
        {
          title: 'Early nutrition matters',
          description:
            'Malnutrition and sarcopenia within 7 days of stroke onset are well-documented. Early nutritional support is a recognised gap in current care.',
          type: 'positive',
        },
        {
          title: 'Await larger trials',
          description:
            'N=30 is too small to draw firm conclusions. This trial will inform sample size calculations for larger multi-centre RCTs.',
          type: 'caution',
        },
      ],
    },
    sections: [
      { id: '1', label: 'Abstract', range: 'p.1' },
      { id: '2', label: 'Background', range: 'p.2' },
      { id: '3', label: 'Methods', range: 'p.3' },
      { id: '4', label: 'Expected Results', range: 'p.7' },
      { id: '5', label: 'Discussion', range: 'p.8' },
      { id: '6', label: 'References', range: 'p.10' },
    ],
    excerpt:
      '"The aim of this study is to verify the effectiveness of creatine supplementation on functional capacity, strength, and changes in muscle mass during hospitalisation for stroke."',
    citations: {
      AMA: 'Multiple authors. ICaRUS Stroke Trial: creatine supplementation for post-stroke muscle loss. PMC. 2023;PMC10035196.',
      Vancouver: 'Multiple authors. ICaRUS Stroke Trial: creatine supplementation for post-stroke muscle loss. PMC. 2023;PMC10035196.',
      APA: 'Multiple authors. (2023). ICaRUS Stroke Trial: creatine supplementation for post-stroke muscle loss. PubMed Central, PMC10035196.',
      Harvard: "Multiple authors (2023) 'ICaRUS Stroke Trial: creatine for post-stroke muscle loss', PubMed Central, PMC10035196.",
      RIS: 'TY - JOUR · TI - ICaRUS Stroke Trial · JO - PMC · DA - 2023 · ID - PMC10035196',
      BibTeX: 'article{icarus2023, title={ICaRUS Stroke Trial: creatine for post-stroke muscle loss}, journal={PMC}, year={2023}, pmcid={PMC10035196}}',
    },
  },
];

export function getPaperBySlug(slug: string): Paper | undefined {
  return papers.find((p) => p.slug === slug);
}

export function getAllSlugs(): string[] {
  return papers.map((p) => p.slug);
}
