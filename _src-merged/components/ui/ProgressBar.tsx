interface ProgressBarProps {
  percent: number;
  variant?: "teal" | "amber" | "muted";
  className?: string;
}

const FILL_CLASS: Record<NonNullable<ProgressBarProps["variant"]>, string> = {
  teal: "bg-teal-deep",
  amber: "bg-amber-ink",
  muted: "bg-ink/40",
};

export default function ProgressBar({
  percent,
  variant = "teal",
  className = "",
}: ProgressBarProps) {
  return (
    <div className={`h-1 rounded-full bg-ink/8 overflow-hidden relative ${className}`}>
      <div
        className={`absolute left-0 top-0 h-full rounded-full transition-[width] duration-500 ${FILL_CLASS[variant]}`}
        style={{ width: `${Math.max(0, Math.min(100, percent))}%` }}
      />
    </div>
  );
}
