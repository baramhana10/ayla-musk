import { InputHTMLAttributes, TextareaHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium tracking-wide text-charcoal/70">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none transition-colors focus:border-deep-rose focus:ring-1 focus:ring-deep-rose/40",
          error && "border-wine focus:border-wine focus:ring-wine/30",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-wine">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium tracking-wide text-charcoal/70">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-lg border border-charcoal/15 bg-ivory px-4 py-3 text-sm text-charcoal placeholder:text-charcoal/35 outline-none transition-colors focus:border-deep-rose focus:ring-1 focus:ring-deep-rose/40",
          error && "border-wine focus:border-wine focus:ring-wine/30",
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-wine">{error}</p>}
    </div>
  )
);
Textarea.displayName = "Textarea";
