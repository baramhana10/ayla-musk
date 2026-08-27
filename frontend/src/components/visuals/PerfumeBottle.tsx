"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";

interface PerfumeBottleProps {
  accent?: string;
  label?: string;
  sublabel?: string;
  className?: string;
  showLabel?: boolean;
  liquidLevel?: number; // 0-1
}

/**
 * Ayla Musk signature bottle — a hand-built SVG render used across the
 * storefront (hero, product cards, PDP gallery) so every product shares one
 * consistent, on-brand visual identity instead of disparate stock photos.
 */
export default function PerfumeBottle({
  accent = "#9c5a63",
  label = "AYLA MUSK",
  sublabel,
  className,
  showLabel = true,
  liquidLevel = 0.6,
}: PerfumeBottleProps) {
  const uid = useId().replace(/[:]/g, "");
  const liquidTop = 148 + (1 - liquidLevel) * 150;

  return (
    <svg
      viewBox="0 0 240 400"
      className={cn("h-full w-full overflow-visible", className)}
      role="img"
      aria-label={`${label} bottle`}
    >
      <defs>
        <radialGradient id={`shadow-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.35" />
          <stop offset="100%" stopColor={accent} stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`glass-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.85" />
          <stop offset="45%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="55%" stopColor={accent} stopOpacity="0.12" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.55" />
        </linearGradient>
        <linearGradient id={`liquid-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={accent} stopOpacity="0.9" />
          <stop offset="100%" stopColor={accent} stopOpacity="0.75" />
        </linearGradient>
        <linearGradient id={`cap-${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8a6b2c" />
          <stop offset="25%" stopColor="#e4c98a" />
          <stop offset="50%" stopColor="#c9a24b" />
          <stop offset="75%" stopColor="#e4c98a" />
          <stop offset="100%" stopColor="#8a6b2c" />
        </linearGradient>
        <clipPath id={`bottle-clip-${uid}`}>
          <path d="M64 148C64 138 70 132 80 132H160C170 132 176 138 176 148V330C176 352 158 370 136 370H104C82 370 64 352 64 330V148Z" />
        </clipPath>
      </defs>

      {/* ground shadow */}
      <ellipse cx="120" cy="384" rx="70" ry="14" fill={`url(#shadow-${uid})`} />

      {/* stopper */}
      <rect x="104" y="18" width="32" height="26" rx="6" fill={`url(#cap-${uid})`} />
      <rect x="98" y="40" width="44" height="20" rx="5" fill={`url(#cap-${uid})`} />
      {/* neck */}
      <rect x="108" y="58" width="24" height="30" rx="3" fill="#f4ede4" fillOpacity="0.55" stroke="#e4c98a" strokeOpacity="0.6" />
      <rect x="96" y="84" width="48" height="18" rx="6" fill="#f4ede4" fillOpacity="0.5" stroke="#e4c98a" strokeOpacity="0.5" />

      {/* bottle body */}
      <path
        d="M64 148C64 138 70 132 80 132H160C170 132 176 138 176 148V330C176 352 158 370 136 370H104C82 370 64 352 64 330V148Z"
        fill={`url(#glass-${uid})`}
        stroke="#ffffff"
        strokeOpacity="0.6"
      />

      <g clipPath={`url(#bottle-clip-${uid})`}>
        <rect x="60" y={liquidTop} width="120" height="230" fill={`url(#liquid-${uid})`} />
        <rect x="60" y={liquidTop} width="120" height="3" fill="#ffffff" fillOpacity="0.5" />
      </g>

      {/* glass highlight streak */}
      <path d="M84 140 L96 140 L78 356 L70 356 Z" fill="#ffffff" fillOpacity="0.35" />

      {/* bottle outline accent */}
      <path
        d="M64 148C64 138 70 132 80 132H160C170 132 176 138 176 148V330C176 352 158 370 136 370H104C82 370 64 352 64 330V148Z"
        fill="none"
        stroke={accent}
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {showLabel && (
        <g>
          <rect x="82" y="222" width="76" height="52" rx="2" fill="#fffaf3" fillOpacity="0.92" stroke={accent} strokeOpacity="0.4" strokeWidth="0.75" />
          <text
            x="120"
            y="244"
            textAnchor="middle"
            fontSize="9.5"
            letterSpacing="1.5"
            fontFamily="var(--font-display, serif)"
            fill={accent}
            fontWeight={600}
          >
            {label}
          </text>
          {sublabel && (
            <text
              x="120"
              y="260"
              textAnchor="middle"
              fontSize="6.5"
              letterSpacing="2"
              fontFamily="var(--font-body, sans-serif)"
              fill="#8a7568"
            >
              {sublabel.toUpperCase()}
            </text>
          )}
        </g>
      )}
    </svg>
  );
}
