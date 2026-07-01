import { Paper } from "@/types/types";
import PaperCard from "./PaperCard";
import { SearchX } from "lucide-react";

interface ResultsGridProps {
  papers: Paper[];
  view: "grid" | "list";
}

export default function ResultsGrid({ papers, view }: ResultsGridProps) {
  if (papers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 border border-dashed border-ink/15 rounded-2xl">
        <SearchX className="text-ink/30 mb-3" size={28} />
        <p className="font-serif text-[19px] text-ink-soft mb-1">
          No papers match these filters
        </p>
        <p className="text-[12.5px] text-ink/50 max-w-[320px]">
          Try removing a filter or broadening your date range to see more
          results.
        </p>
      </div>
    );
  }

  return (
    <div
      className={
        view === "grid"
          ? "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          : "flex flex-col gap-4"
      }
    >
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </div>
  );
}
