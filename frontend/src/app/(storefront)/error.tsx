"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import Button, { buttonVariants } from "@/components/ui/Button";

export default function StorefrontError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container-luxe flex flex-col items-center justify-center gap-4 py-32 text-center">
      <AlertCircle size={40} className="text-wine/60" />
      <h1 className="font-display text-3xl text-charcoal sm:text-4xl">Something went astray</h1>
      <p className="max-w-sm text-sm text-charcoal/55">
        We hit an unexpected issue loading this page. Please try again, or head back to the collection.
      </p>
      <div className="mt-4 flex gap-3">
        <Button size="lg" onClick={reset}>Try Again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline", size: "lg" })}>Return Home</Link>
      </div>
    </div>
  );
}
