"use client";

import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export function AccordionItem({
  title,
  children,
  defaultOpen = false,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-charcoal/10">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between py-5 text-start cursor-pointer group"
        aria-expanded={open}
      >
        <span className="font-display text-lg text-charcoal group-hover:text-deep-rose transition-colors">
          {title}
        </span>
        <Plus
          size={18}
          className={cn("text-deep-rose transition-transform duration-300 shrink-0 ms-4", open && "rotate-45")}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="pb-5 text-sm leading-relaxed text-charcoal/65">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Accordion({ children }: { children: ReactNode }) {
  return <div className="divide-y-0">{children}</div>;
}
