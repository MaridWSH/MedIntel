interface RadioOptionProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function RadioOption({
  active,
  onClick,
  children,
  className = "",
}: RadioOptionProps) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 cursor-pointer transition-colors duration-200 hover:bg-ink/[0.03] ${className}`}
    >
      <div
        className={`w-3.5 h-3.5 rounded-full border-[1.5px] relative shrink-0 transition-colors duration-200 ${
          active ? "border-teal-deep" : "border-ink/30"
        }`}
      >
        <span
          className={`absolute inset-0 m-auto w-1.5 h-1.5 rounded-full bg-teal-deep transition-transform duration-200 ${
            active ? "scale-100" : "scale-0"
          }`}
        />
      </div>
      {children}
    </div>
  );
}
