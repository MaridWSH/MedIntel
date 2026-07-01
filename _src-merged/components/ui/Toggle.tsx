"use client";

import { useState } from "react";

interface ToggleProps {
  defaultOn?: boolean;
  disabled?: boolean;
  onChange?: (on: boolean) => void;
  label?: string;
}

export default function Toggle({
  defaultOn = false,
  disabled = false,
  onChange,
  label,
}: ToggleProps) {
  const [on, setOn] = useState(defaultOn);

  const toggle = () => {
    if (disabled) return;
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={toggle}
      disabled={disabled}
      className={`relative w-8 h-[18px] rounded-full shrink-0 transition-colors duration-200 ${
        disabled
          ? "bg-ink/20 opacity-40 cursor-not-allowed"
          : on
          ? "bg-teal-deep cursor-pointer"
          : "bg-ink/20 cursor-pointer"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-3.5 h-3.5 rounded-full bg-paper shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-transform duration-300 ${
          on ? "translate-x-3.5" : "translate-x-0"
        }`}
      />
    </button>
  );
}
