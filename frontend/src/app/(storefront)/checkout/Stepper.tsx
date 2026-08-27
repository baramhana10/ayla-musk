"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useT } from "@/store/locale";

export default function Stepper({ current }: { current: number }) {
  const t = useT();
  const steps = [t("checkout.stepShipping"), t("checkout.stepReview")];
  return (
    <div className="flex items-center justify-center gap-2 sm:gap-4">
      {steps.map((label, i) => {
        const stepNum = i + 1;
        const state = stepNum < current ? "done" : stepNum === current ? "active" : "upcoming";
        return (
          <div key={label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors",
                  state === "done" && "bg-deep-rose text-ivory",
                  state === "active" && "bg-charcoal text-ivory",
                  state === "upcoming" && "bg-blush text-charcoal/40"
                )}
              >
                {state === "done" ? <Check size={14} /> : stepNum}
              </div>
              <span className={cn("hidden text-sm sm:inline", state === "upcoming" ? "text-charcoal/40" : "text-charcoal")}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="h-px w-6 bg-charcoal/15 sm:w-12" />}
          </div>
        );
      })}
    </div>
  );
}
