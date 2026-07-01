export interface Invoice {
  id: string;
  date: string;
  amount: string;
  status: "paid" | "prorate";
}

export interface CmeCategory {
  label: string;
  hours: number;
  goalHours: number;
}

export interface CreditActivity {
  title: string;
  meta: string;
  hours: string;
  date: string;
}

export interface Session {
  id: string;
  device: string;
  location: string;
  meta: string;
  icon: "monitor" | "smartphone";
  current: boolean;
}

export interface DigestFrequencyOption {
  id: "daily" | "weekly" | "off";
  label: string;
}

export interface SettingsTab {
  id: string;
  label: string;
  icon: string;
  badge?: string;
}
