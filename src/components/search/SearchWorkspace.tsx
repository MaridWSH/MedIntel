"use client";

import { useMemo, useState } from "react";
import SearchHero, { ActiveChip } from "./SearchHero";
import FilterSidebar, { FilterState } from "@/components/search/FilterSidebar";
import ResultsToolbar from "@/components/search/ResultsToolbar";
import ResultsGrid from "@/components/search/ResultsGrid";
import Pagination from "@/components/search/Pagination";
import TipsSection from "@/components/search/TipsSection";
import {
  EVIDENCE_LEVELS,
  PAPERS,
  SPECIALTIES,
  STUDY_TYPES,
  VALIDATION_STATUSES,
} from "@/lib/data";
import { Paper, SortOption } from "@/types/types";

const DEFAULT_FILTERS: FilterState = {
  specialties: ["cardiology", "endocrinology"],
  studyTypes: ["systematic-review"],
  evidenceLevels: ["level-1", "level-2"],
  validationStatuses: ["validated"],
  dateFrom: "2022-01",
  dateTo: "2024-12",
};

const PAGE_SIZE = 6;

function labelFor(id: string, options: { id: string; label: string }[]) {
  return options.find((o) => o.id === id)?.label ?? id;
}

export default function SearchWorkspace() {
  const [query, setQuery] = useState("semaglutide cardiovascular outcomes 2024");
  const [submittedQuery, setSubmittedQuery] = useState(query);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("relevance");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [page, setPage] = useState(1);

  const toggleFilter = (
    group: keyof Omit<FilterState, "dateFrom" | "dateTo">,
    id: string
  ) => {
    setFilters((prev) => {
      const current = prev[group];
      const next = current.includes(id)
        ? current.filter((v) => v !== id)
        : [...current, id];
      return { ...prev, [group]: next };
    });
    setPage(1);
  };

  const setDateRange = (dateFrom: string, dateTo: string) => {
    setFilters((prev) => ({ ...prev, dateFrom, dateTo }));
    setPage(1);
  };

  const resetFilters = () => {
    setFilters({
      specialties: [],
      studyTypes: [],
      evidenceLevels: [],
      validationStatuses: [],
      dateFrom: "",
      dateTo: "",
    });
    setPage(1);
  };

  const filteredPapers = useMemo(() => {
    const q = submittedQuery.trim().toLowerCase();

    let result: Paper[] = PAPERS.filter((paper) => {
      const matchesQuery =
        !q ||
        paper.title.toLowerCase().includes(q) ||
        paper.journal.toLowerCase().includes(q) ||
        paper.tags.some((t) => t.toLowerCase().includes(q));

      const specialtyLabels = filters.specialties.map((id) =>
        labelFor(id, SPECIALTIES)
      );
      const matchesSpecialty =
        filters.specialties.length === 0 ||
        paper.tags.some((t) => specialtyLabels.includes(t));

      const matchesStudyType =
        filters.studyTypes.length === 0 ||
        filters.studyTypes.includes(paper.studyType);

      const matchesEvidenceLevel =
        filters.evidenceLevels.length === 0 ||
        filters.evidenceLevels.includes(paper.evidenceLevel);

      const matchesValidation =
        filters.validationStatuses.length === 0 ||
        filters.validationStatuses.includes(paper.status);

      const fromYear = filters.dateFrom
        ? parseInt(filters.dateFrom.slice(0, 4), 10)
        : null;
      const toYear = filters.dateTo
        ? parseInt(filters.dateTo.slice(0, 4), 10)
        : null;
      const matchesDate =
        (!fromYear || paper.publishedYear >= fromYear) &&
        (!toYear || paper.publishedYear <= toYear);

      return (
        matchesQuery &&
        matchesSpecialty &&
        matchesStudyType &&
        matchesEvidenceLevel &&
        matchesValidation &&
        matchesDate
      );
    });

    result = [...result].sort((a, b) => {
      switch (sort) {
        case "newest":
          return b.publishedYear - a.publishedYear;
        case "most-cited":
        case "practice-changing":
          return b.citations - a.citations;
        case "grade":
          return a.gradeLabel.localeCompare(b.gradeLabel);
        default:
          return 0;
      }
    });

    return result;
  }, [submittedQuery, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredPapers.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedPapers = filteredPapers.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );
  const validatedCount = filteredPapers.filter(
    (p) => p.status === "validated"
  ).length;

  const chips: ActiveChip[] = [
    ...filters.specialties.map((id) => ({
      key: `specialty-${id}`,
      label: labelFor(id, SPECIALTIES),
      onRemove: () => toggleFilter("specialties", id),
    })),
    ...filters.studyTypes.map((id) => ({
      key: `study-${id}`,
      label: labelFor(id, STUDY_TYPES),
      onRemove: () => toggleFilter("studyTypes", id),
    })),
    ...filters.validationStatuses.map((id) => ({
      key: `validation-${id}`,
      label: labelFor(id, VALIDATION_STATUSES),
      onRemove: () => toggleFilter("validationStatuses", id),
    })),
    ...(filters.dateFrom && filters.dateTo
      ? [
          {
            key: "date-range",
            label: `${filters.dateFrom.slice(0, 4)} — ${filters.dateTo.slice(0, 4)}`,
            onRemove: () => setDateRange("", ""),
          },
        ]
      : []),
    ...filters.evidenceLevels.map((id) => ({
      key: `evidence-${id}`,
      label: `${labelFor(id, EVIDENCE_LEVELS).split(" ")[0]} ${labelFor(id, EVIDENCE_LEVELS).split(" ")[1]} ≥`,
      emphasized: true,
      onRemove: () => toggleFilter("evidenceLevels", id),
    })),
  ];

  return (
    <main className="relative">
      <SearchHero
        query={query}
        onQueryChange={setQuery}
        onSubmit={() => {
          setSubmittedQuery(query);
          setPage(1);
        }}
        chips={chips}
        resultCount={filteredPapers.length}
      />

      <section className="relative max-w-[1380px] mx-auto px-6 py-8 grid grid-cols-12 gap-8">
        <FilterSidebar
          filters={filters}
          onToggle={toggleFilter}
          onDateChange={setDateRange}
          onReset={resetFilters}
        />

        <div
          className="col-span-12 lg:col-span-9 animate-fade-up"
          style={{ animationDelay: "0.32s" }}
        >
          <ResultsToolbar
            total={filteredPapers.length}
            validatedCount={validatedCount}
            sort={sort}
            onSortChange={setSort}
            view={view}
            onViewChange={setView}
          />

          <ResultsGrid papers={pagedPapers} view={view} />

          {filteredPapers.length > 0 && (
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              totalResults={filteredPapers.length}
              pageSize={PAGE_SIZE}
              onPageChange={setPage}
            />
          )}
        </div>
      </section>

      <TipsSection />
    </main>
  );
}
