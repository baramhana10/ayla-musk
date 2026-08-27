import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "icon";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-deep-rose text-ivory hover:bg-wine shadow-sm hover:shadow-md",
  secondary: "bg-blush text-charcoal hover:bg-pink-soft",
  outline: "border border-charcoal/25 text-charcoal hover:border-deep-rose hover:text-deep-rose bg-transparent",
  ghost: "bg-transparent text-charcoal hover:bg-blush/60",
  link: "bg-transparent text-deep-rose underline-offset-4 hover:underline p-0 h-auto rounded-none",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-xs",
  md: "h-11 px-6 text-sm",
  lg: "h-14 px-9 text-sm",
  icon: "h-10 w-10",
};

export function buttonVariants({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(
    "relative inline-flex items-center justify-center gap-2 rounded-full font-body font-medium tracking-wide transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] disabled:opacity-40 disabled:pointer-events-none cursor-pointer active:scale-[0.97]",
    variants[variant],
    sizes[size],
    className
  );
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return <button ref={ref} className={buttonVariants({ variant, size, className })} {...props} />;
  }
);
Button.displayName = "Button";

export default Button;
