export type Plan = "free" | "professional" | "research";

const plans: { id: Plan; label: string; badge: string; price: number; features: string[]; mostChosen?: boolean }[] = [
  {
    id: "free",
    label: "Free",
    badge: "ALWAYS FREE",
    price: 0,
    features: ["5 syntheses / month", "TLDR + infographic"],
  },
  {
    id: "professional",
    label: "Professional",
    badge: "PRACTISING MD",
    price: 19,
    features: ["All six agents, unlimited", "Mind map & critical appraisal"],
    mostChosen: true,
  },
  {
    id: "research",
    label: "Research Pro",
    badge: "FELLOW · ACADEMIC",
    price: 39,
    features: ["Everything in Professional", "PRISMA export + collaborators"],
  },
];

interface PlanCardsProps {
  selected: Plan;
  onSelect: (plan: Plan) => void;
}

export default function PlanCards({ selected, onSelect }: PlanCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {plans.map((p) => {
        const isSelected = selected === p.id;
        const isProfessional = p.id === "professional";
        return (
          <label key={p.id} className="block cursor-pointer">
            <input
              type="radio"
              name="plan"
              value={p.id}
              checked={isSelected}
              onChange={() => onSelect(p.id)}
              className="sr-only"
            />
            <div className={`plan-card relative border rounded-2xl p-5 transition-all ${
              isProfessional
                ? "bg-ink text-paper border-ink"
                : "bg-paper border-ink-15"
            }`}>
              {p.mostChosen && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 h-5 rounded-full bg-teal-bright text-ink text-[9.5px] mono-stat font-semibold inline-flex items-center">
                  MOST CHOSEN
                </div>
              )}
              <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center plan-check transition-all ${
                isSelected
                  ? isProfessional
                    ? "opacity-100 bg-teal-bright text-ink"
                    : "opacity-100 bg-ink text-paper"
                  : "opacity-0 scale-60 bg-ink text-paper"
              }`}>
                <iconify-icon icon="lucide:check" className={`text-[14px] ${isProfessional ? "" : "text-teal-bright"}`}></iconify-icon>
              </div>
              <div className={`text-[9.5px] mono-stat mb-2 ${isProfessional ? "text-paper/55" : "text-ink/45"}`}>{p.badge}</div>
              <div className={`serif text-[22px] tracking-tight leading-tight ${isProfessional ? "text-paper" : ""}`}>{p.label}</div>
              <div className="flex items-baseline gap-1 mt-1.5 mb-3">
                <span className={`serif text-[32px] leading-none tracking-tight ${isProfessional ? "text-paper" : ""}`}>${p.price}</span>
                <span className={`text-[11px] ${isProfessional ? "text-paper/55" : "text-ink/55"}`}>/ mo</span>
              </div>
              <ul className={`space-y-1.5 text-[11.5px] ${isProfessional ? "text-paper/85" : "text-ink-soft"}`}>
                {p.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-1.5">
                    <iconify-icon icon="lucide:check" className={`text-[12px] mt-0.5 shrink-0 ${isProfessional ? "text-teal-bright" : "text-teal"}`}></iconify-icon>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </label>
        );
      })}
    </div>
  );
}
