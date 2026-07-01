import { FilterOption, Paper } from "../types/types";

export const PAPERS: Paper[] = [
  {
    id: "p1",
    studyType: "randomised-trial",
    evidenceLevel: "level-1",
    journal: "NEJM",
    date: "2024;391:106-116",
    title:
      "Once-Weekly Semaglutide and Cardiovascular Outcomes in Adults with Overweight or Obesity",
    status: "validated",
    tldr:
      "In adults with overweight or obesity and established cardiovascular disease, weekly subcutaneous semaglutide reduced the composite of cardiovascular death, MI, and stroke by 21%.",
    hrValue: "0.79",
    pValue: "< 0.001",
    gradeLabel: "GRADE A",
    tags: ["Cardiology", "Endocrinology", "Prevention"],
    citations: 1042,
    publishedYear: 2024,
    timeAgo: "11.8s ago",
    viewHref: "#",
  },
  {
    id: "p2",
    studyType: "randomised-trial",
    evidenceLevel: "level-1",
    journal: "Lancet",
    date: "2024;403:1214-1226",
    title:
      "Effect of Semaglutide on Heart Failure Symptoms in Patients with Obesity and HFpEF",
    status: "validated",
    tldr:
      "Once-weekly semaglutide improved Kansas City Cardiomyopathy Questionnaire score by 16.6 points versus placebo in patients with HFpEF and obesity over 52 weeks.",
    hrValue: "1.76",
    pValue: "< 0.001",
    gradeLabel: "GRADE A",
    tags: ["Cardiology", "Heart Failure"],
    citations: 612,
    publishedYear: 2024,
    timeAgo: "2.4s ago",
    viewHref: "#",
  },
  {
    id: "p3",
    studyType: "cohort-study",
    evidenceLevel: "level-2",
    journal: "medRxiv",
    date: "2024.07.14.24310841",
    title:
      "Renal Protective Effects of GLP-1 Receptor Agonists in Patients with T2DM and CKD Stage 3-4",
    status: "preprint",
    tldr:
      "In a retrospective cohort of 4,218 patients with T2DM and CKD stage 3-4, GLP-1 RA therapy was associated with a 31% reduction in composite renal outcomes over 36 months.",
    hrValue: "0.69",
    pValue: "0.002",
    gradeLabel: "GRADE C",
    tags: ["Nephrology", "Endocrinology"],
    citations: 58,
    publishedYear: 2024,
    timeAgo: "8.1s ago",
    viewHref: "#",
  },
  {
    id: "p4",
    studyType: "randomised-trial",
    evidenceLevel: "level-1",
    journal: "JAMA",
    date: "2024;331:1421-1430",
    title:
      "Tirzepatide vs Semaglutide for Weight Loss in Adults with Obesity: A Randomized Noninferiority Trial",
    status: "validated",
    tldr:
      "Tirzepatide achieved a 22.4% mean weight reduction vs 14.8% with semaglutide at 72 weeks, meeting noninferiority criteria and showing superior efficacy.",
    hrValue: "1.51",
    pValue: "< 0.001",
    gradeLabel: "GRADE A",
    tags: ["Endocrinology", "Prevention"],
    citations: 887,
    publishedYear: 2024,
    timeAgo: "3.7s ago",
    viewHref: "#",
  },
  {
    id: "p5",
    studyType: "systematic-review",
    evidenceLevel: "level-1",
    journal: "BMJ",
    date: "2023;383:e076346",
    title:
      "Long-term Cardiovascular Safety of GLP-1 Receptor Agonists: A Systematic Review and Meta-analysis",
    status: "validated",
    tldr:
      "Pooled analysis of 38 RCTs (n=84,212) confirms GLP-1 RAs reduce MACE by 14%, with consistent safety across cardiovascular, renal, and retinal endpoints.",
    hrValue: "0.86",
    pValue: "< 0.001",
    gradeLabel: "GRADE A",
    tags: ["Cardiology", "Prevention", "Pharmacology"],
    citations: 1530,
    publishedYear: 2023,
    timeAgo: "1.2s ago",
    viewHref: "#",
  },
  {
    id: "p6",
    studyType: "cohort-study",
    evidenceLevel: "level-2",
    journal: "Eur Heart J",
    date: "2024;45:2893-2904",
    title:
      "Real-world Effectiveness of Once-Weekly Semaglutide in Heart Failure with Reduced Ejection Fraction",
    status: "pending",
    tldr:
      "In a propensity-matched registry of 2,408 patients, semaglutide use in HFrEF was associated with a 19% relative reduction in heart failure hospitalisations.",
    hrValue: "0.81",
    pValue: "0.003",
    gradeLabel: "GRADE B",
    tags: ["Cardiology", "Heart Failure"],
    citations: 214,
    publishedYear: 2024,
    timeAgo: "4.6s ago",
    viewHref: "#",
  },
  {
    id: "p7",
    studyType: "cohort-study",
    evidenceLevel: "level-2",
    journal: "Circulation",
    date: "2023;148:1426-1438",
    title:
      "Incretin-based Therapies and Arrhythmia Risk: A Multi-database Cohort Study",
    status: "validated",
    tldr:
      "Across 1.2 million patients, GLP-1 RA exposure was not associated with increased atrial or ventricular arrhythmia risk, supporting cardiovascular safety.",
    hrValue: "0.94",
    pValue: "0.18",
    gradeLabel: "GRADE B",
    tags: ["Cardiology", "Arrhythmia", "Pharmacology"],
    citations: 341,
    publishedYear: 2023,
    timeAgo: "5.2s ago",
    viewHref: "#",
  },
  {
    id: "p8",
    studyType: "randomised-trial",
    evidenceLevel: "level-1",
    journal: "N Engl J Med",
    date: "2023;389:514-526",
    title:
      "Oral Semaglutide and Composite Cardiovascular Outcomes in Type 2 Diabetes",
    status: "validated",
    tldr:
      "Oral semaglutide 14 mg daily reduced the composite of CV death, nonfatal MI, and nonfatal stroke by 14% versus placebo in T2DM patients over 32 months.",
    hrValue: "0.86",
    pValue: "0.01",
    gradeLabel: "GRADE A",
    tags: ["Cardiology", "Endocrinology"],
    citations: 962,
    publishedYear: 2023,
    timeAgo: "6.3s ago",
    viewHref: "#",
  },
  {
    id: "p9",
    studyType: "cohort-study",
    evidenceLevel: "level-2",
    journal: "Diabetes Care",
    date: "2024;47:1314-1322",
    title:
      "Effect of Continuous Semaglutide Use on Hospital Readmission in Patients with HFpEF",
    status: "validated",
    tldr:
      "Patients with HFpEF discharge-initiated on semaglutide had 23% fewer 30-day readmissions in a propensity-matched cohort of 1,892 patients.",
    hrValue: "0.77",
    pValue: "0.004",
    gradeLabel: "GRADE B",
    tags: ["Cardiology", "Heart Failure", "Prevention"],
    citations: 176,
    publishedYear: 2024,
    timeAgo: "9.4s ago",
    viewHref: "#",
  },
];

export const SPECIALTIES: FilterOption[] = [
  { id: "cardiology", label: "Cardiology", count: 642 },
  { id: "endocrinology", label: "Endocrinology", count: 418 },
  { id: "internal-medicine", label: "Internal medicine", count: 312 },
  { id: "nephrology", label: "Nephrology", count: 147 },
  { id: "preventive-medicine", label: "Preventive medicine", count: 98 },
];

export const STUDY_TYPES: FilterOption[] = [
  { id: "systematic-review", label: "Systematic review", count: 284 },
  { id: "randomised-trial", label: "Randomised trial", count: 498 },
  { id: "meta-analysis", label: "Meta-analysis", count: 112 },
  { id: "cohort-study", label: "Cohort study", count: 329 },
  { id: "case-control", label: "Case-control", count: 84 },
  { id: "guideline", label: "Guideline", count: 29 },
];

export const EVIDENCE_LEVELS: FilterOption[] = [
  { id: "level-1", label: "Level I (RCT, SR)", count: 412 },
  { id: "level-2", label: "Level II (Cohort)", count: 329 },
  { id: "level-3", label: "Level III (Case-control)", count: 84 },
  { id: "level-4", label: "Level IV (Expert opinion)", count: 29 },
];

export const VALIDATION_STATUSES: FilterOption[] = [
  { id: "validated", label: "Validated (MD-reviewed)", count: 1184 },
  { id: "pending", label: "Pending review", count: 478 },
  { id: "preprint", label: "Preprint (not peer-reviewed)", count: 185 },
];

export const YEAR_HISTOGRAM = [24, 38, 56, 82, 100, 32, 22];
export const YEAR_LABELS = ["2018", "2020", "2022", "2024"];
