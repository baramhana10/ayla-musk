import { SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, children, ...props }, ref) => {
    const generatedId = useId();
    const selectId = id ?? generatedId;
    const errorId = `${selectId}-error`;
    return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="mb-1.5 block text-xs font-medium tracking-wide text-charcoal/70">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : props["aria-describedby"]}
          className={cn(
            "w-full appearance-none rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 pe-9 text-sm text-charcoal outline-none transition-colors focus:border-deep-rose focus:ring-1 focus:ring-deep-rose/40 cursor-pointer",
            error && "border-wine focus:border-wine focus:ring-wine/30",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown size={15} className="pointer-events-none absolute end-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
      </div>
      {error && <p id={errorId} role="alert" className="mt-1 text-xs text-wine">{error}</p>}
    </div>
  ); }
);
Select.displayName = "Select";

export default Select;
