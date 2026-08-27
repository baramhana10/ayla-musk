import Link from "next/link";
import { Flower2 } from "lucide-react";
import { buttonVariants } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="container-luxe flex flex-col items-center justify-center gap-4 py-32 text-center">
      <Flower2 size={40} className="text-deep-rose/40" />
      <span className="text-xs font-semibold uppercase tracking-[0.25em] text-deep-rose">404</span>
      <h1 className="font-display text-4xl text-charcoal sm:text-5xl">This page has wandered off</h1>
      <p className="max-w-sm text-sm text-charcoal/55">
        The page you&apos;re looking for doesn&apos;t exist, or may have moved. Let&apos;s get you back to something beautiful.
      </p>
      <div className="mt-4 flex gap-3">
        <Link href="/" className={buttonVariants({ size: "lg" })}>Return Home</Link>
        <Link href="/shop" className={buttonVariants({ variant: "outline", size: "lg" })}>Shop the Collection</Link>
      </div>
    </div>
  );
}
