import Image from "next/image";
import PerfumeBottle from "@/components/visuals/PerfumeBottle";
import { cn } from "@/lib/utils";

/**
 * Small square/portrait product thumbnail used in cart, checkout, order
 * history and admin tables. Falls back to the signature bottle illustration
 * for the rare product with no photography set yet.
 */
export default function ProductThumb({
  src,
  alt,
  accent,
  className,
}: {
  src?: string;
  alt: string;
  accent: string;
  className?: string;
}) {
  if (src) {
    return (
      <div className={cn("relative overflow-hidden rounded-lg bg-blush-soft/60", className)}>
        <Image src={src} alt={alt} fill sizes="80px" className="object-cover" />
      </div>
    );
  }
  return (
    <div className={cn("overflow-hidden rounded-lg bg-gradient-to-b from-blush-soft to-ivory-deep p-1.5", className)}>
      <PerfumeBottle accent={accent} showLabel={false} />
    </div>
  );
}
