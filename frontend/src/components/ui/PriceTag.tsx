import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function PriceTag({
  price,
  compareAtPrice,
  size = "md",
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const sizes = { sm: "text-sm", md: "text-base", lg: "text-2xl" };
  return (
    <div className={cn("flex items-baseline gap-2", className)}>
      <span className={cn("font-medium text-charcoal", sizes[size])}>{formatPrice(price)}</span>
      {compareAtPrice && compareAtPrice > price && (
        <span className="text-charcoal/40 line-through text-xs">{formatPrice(compareAtPrice)}</span>
      )}
    </div>
  );
}
