"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import type { Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const [origin, setOrigin] = useState("50% 50%");
  const [zoomed, setZoomed] = useState(false);

  const images = product.images.length > 0 ? product.images : [];

  function handleMouseMove(e: React.MouseEvent) {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  }

  const current = images[active];

  return (
    <div className="flex flex-col-reverse gap-4 sm:flex-row">
      {images.length > 1 && (
        <div className="flex shrink-0 gap-3 overflow-x-auto sm:flex-col sm:overflow-visible">
          {images.map((src, i) => (
            <button
              key={src}
              onClick={() => setActive(i)}
              className={cn(
                "relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border bg-gradient-to-b from-blush-soft to-ivory-deep transition-colors cursor-pointer",
                active === i ? "border-deep-rose" : "border-charcoal/10"
              )}
            >
              <Image src={src} alt={product.name} fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}

      <div
        ref={frameRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}
        className="relative aspect-[4/5] flex-1 cursor-zoom-in overflow-hidden rounded-2xl bg-gradient-to-b from-blush-soft to-ivory-deep"
      >
        <div
          className="absolute inset-0 opacity-70"
          style={{ background: `radial-gradient(circle at 50% 30%, ${product.accent}30, transparent 65%)` }}
        />
        {current && (
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full w-full transition-transform duration-300 ease-out"
            style={{ transformOrigin: origin, transform: zoomed ? "scale(1.35)" : "scale(1)" }}
          >
            <Image src={current} alt={product.name} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" />
          </motion.div>
        )}
      </div>
    </div>
  );
}
