"use client";

import { Minus, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";

const sizes = {
  md: { pill: "h-10", btn: "h-10 w-10", icon: 14, text: "w-8 text-sm" },
  lg: { pill: "h-14", btn: "h-14 w-12", icon: 16, text: "w-10 text-base" },
};

export default function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "md" | "lg";
  className?: string;
}) {
  const t = useT();
  const s = sizes[size];

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-charcoal/15 bg-ivory",
        s.pill,
        className
      )}
    >
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
        aria-label={t("product.decreaseQuantity")}
        onClick={() => onChange(Math.max(min, value - 1))}
        className={cn(
          "flex items-center justify-center text-charcoal/60 transition-colors hover:text-deep-rose disabled:cursor-not-allowed disabled:opacity-30",
          value > min && "cursor-pointer",
          s.btn
        )}
        disabled={value <= min}
      >
        <Minus size={s.icon} />
      </motion.button>
      <span className={cn("text-center font-medium tabular-nums text-charcoal", s.text)}>{value}</span>
      <motion.button
        type="button"
        whileTap={{ scale: 0.86 }}
        aria-label={t("product.increaseQuantity")}
        onClick={() => onChange(Math.min(max, value + 1))}
        className={cn(
          "flex items-center justify-center text-charcoal/60 transition-colors hover:text-deep-rose disabled:cursor-not-allowed disabled:opacity-30",
          value < max && "cursor-pointer",
          s.btn
        )}
        disabled={value >= max}
      >
        <Plus size={s.icon} />
      </motion.button>
    </div>
  );
}
