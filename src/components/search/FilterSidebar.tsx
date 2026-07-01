"use client";

import {
  SlidersHorizontal,
  Stethoscope,
  FileText,
  ShieldCheck,
  BadgeCheck,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import FilterGroup from "./FilterGroup";
import DateRangeFilter from "./DateRangeFilter";
import SaveSearchCard from "./SaveSearchCard";
import { EVIDENCE_LEVELS, SPECIALTIES, STUDY_TYPES, VALIDATION_STATUSES } from "@/lib/data";

export interface FilterState {
  specialties: string[];
  studyTypes: string[];
  evidenceLevels: string[];
  validationStatuses: string[];
  dateFrom: string;
  dateTo: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  onToggle: (group: keyof Omit<FilterState, "dateFrom" | "dateTo">, id: string) => void;
  onDateChange: (from: string, to: string) => void;
  onReset: () => void;
}

export default function FilterSidebar({
  filters,
  onToggle,
  onDateChange,
  onReset,
}: FilterSidebarProps) {
  return (
    <aside className="col-span-12 lg:col-span-3 animate-fade-up" style={{ animationDelay: "0.24s" }}>
      <div className="lg:sticky lg:top-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-[20px] tracking-tight flex items-center gap-2">
            <SlidersHorizontal className="text-teal-deep" size={18} />
            Filters
          </h2>
          <button
            onClick={onReset}
            className="text-[10.5px] mono-stat text-teal-deep hover:underline"
          >
            RESET ALL
          </button>
        </div>

        <FilterGroup
          title="Specialty"
          icon={Stethoscope}
          options={SPECIALTIES}
          selected={filters.specialties}
          onToggle={(id) => onToggle("specialties", id)}
          searchable
          initialVisible={5}
        />

        <FilterGroup
          title="Study Type"
          icon={FileText}
          options={STUDY_TYPES}
          selected={filters.studyTypes}
          onToggle={(id) => onToggle("studyTypes", id)}
        />

        <DateRangeFilter
          from={filters.dateFrom}
          to={filters.dateTo}
          onChange={onDateChange}
        />

        <FilterGroup
          title="Evidence Level"
          icon={ShieldCheck}
          options={EVIDENCE_LEVELS}
          selected={filters.evidenceLevels}
          onToggle={(id) => onToggle("evidenceLevels", id)}
        />

        <FilterGroup
          title="Validation Status"
          icon={BadgeCheck}
          options={VALIDATION_STATUSES}
          selected={filters.validationStatuses}
          onToggle={(id) => onToggle("validationStatuses", id)}
        />

        <div className="bg-paper border border-ink/12 rounded-2xl overflow-hidden">
          <button className="w-full flex items-center justify-between px-4 h-11 hover:bg-ink/5 transition-colors">
            <span className="flex items-center gap-2 text-[12.5px] font-semibold text-ink-soft">
              <BookOpen className="text-teal-deep" size={15} />
              Journal
            </span>
            <ChevronRight className="text-ink/45" size={14} />
          </button>
        </div>

        <SaveSearchCard />
      </div>
    </aside>
  );
}
