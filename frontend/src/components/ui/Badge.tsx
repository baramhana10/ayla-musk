import { cn } from "@/lib/utils";

export default function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode;
  variant?: "default" | "gold" | "outline" | "sale";
  className?: string;
}) {
  const variants = {
    default: "bg-blush text-deep-rose",
    gold: "bg-champagne/20 text-[#8a6b2c]",
    outline: "border border-charcoal/20 text-charcoal/70",
    sale: "bg-wine text-ivory",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] uppercase",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
