import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-charcoal/10 bg-ivory p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-charcoal/45">{label}</p>
        <Icon size={16} className="text-deep-rose" />
      </div>
      <p className="mt-3 font-display text-3xl text-charcoal">{value}</p>
      {hint && <p className="mt-1 text-xs text-charcoal/45">{hint}</p>}
    </div>
  );
}
