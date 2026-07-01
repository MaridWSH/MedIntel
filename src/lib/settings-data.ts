import {
  CmeCategory,
  CreditActivity,
  DigestFrequencyOption,
  Invoice,
  Session,
  SettingsTab,
} from "./settings-types";

export const SETTINGS_TABS: SettingsTab[] = [
  { id: "subscription", label: "Subscription & Billing", icon: "credit-card" },
  { id: "cme", label: "CME Credits", icon: "award", badge: "14h" },
  { id: "preferences", label: "Preferences", icon: "sliders-horizontal" },
  { id: "security", label: "Security & Privacy", icon: "lock" },
  { id: "account", label: "Account", icon: "user" },
];

export const INVOICES: Invoice[] = [
  { id: "#INV-2024-12-1482", date: "15 Dec 2024", amount: "$152.00", status: "paid" },
  { id: "#INV-2024-11-1184", date: "15 Nov 2024", amount: "$152.00", status: "paid" },
  { id: "#INV-2024-10-0947", date: "15 Oct 2024", amount: "$152.00", status: "paid" },
  { id: "#INV-2024-03-0184", date: "15 Mar 2024", amount: "$39.00", status: "prorate" },
];

export const CME_CATEGORIES: CmeCategory[] = [
  { label: "Cardiology", hours: 8.5, goalHours: 20 },
  { label: "Internal Med", hours: 3.0, goalHours: 15 },
  { label: "Prevention", hours: 3.0, goalHours: 15 },
];

export const RECENT_CREDITS: CreditActivity[] = [
  {
    title: "Once-Weekly Semaglutide and CV Outcomes",
    meta: "NEJM 2024 · CARDIOLOGY · QUIZ PASSED 100%",
    hours: "+0.5h",
    date: "11 DEC",
  },
  {
    title: "Empagliflozin and Heart Failure",
    meta: "NEJM 2023 · CARDIOLOGY · QUIZ PASSED 80%",
    hours: "+0.5h",
    date: "04 DEC",
  },
  {
    title: "Colchicine for Chronic Coronary Disease",
    meta: "NEJM 2023 · CARDIOLOGY · QUIZ PASSED 90%",
    hours: "+0.5h",
    date: "22 NOV",
  },
];

export const SESSIONS: Session[] = [
  {
    id: "s1",
    device: "MacBook Pro · Cairo, EG",
    location: "Cairo, EG",
    meta: "CURRENT · CHROME · 192.168.1.4",
    icon: "monitor",
    current: true,
  },
  {
    id: "s2",
    device: "iPhone 15 Pro · Cairo, EG",
    location: "Cairo, EG",
    meta: "CLARITAS iOS · LAST ACTIVE 2H AGO",
    icon: "smartphone",
    current: false,
  },
];

export const DIGEST_FREQUENCIES: DigestFrequencyOption[] = [
  { id: "daily", label: "Daily · 06:00 EET" },
  { id: "weekly", label: "Weekly · Sundays" },
  { id: "off", label: "Off" },
];
