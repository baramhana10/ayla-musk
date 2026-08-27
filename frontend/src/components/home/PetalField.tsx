"use client";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  scale: number;
  drift: number;
  opacity: number;
}

function PetalShape({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} fill="none">
      <path
        d="M12 2C16 6 20 9 12 22C4 9 8 6 12 2Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Deterministic pseudo-random hash (mulberry32) so petal layout is pure and
// identical between server and client render. Math.sin/cos-based hashes
// look pure but aren't safe here: transcendental functions are only
// "implementation-approximated" per spec, so the same input can produce
// different low-order bits on Node (SSR) vs the browser (CSR) and break
// hydration. This uses only 32-bit integer ops (xor/shift/Math.imul),
// which the spec guarantees are exact everywhere.
function hash(seed: number) {
  let t = (seed + 0x6d2b79f5) | 0;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}

const round = (n: number, places = 3) => Math.round(n * 10 ** places) / 10 ** places;

function generatePetals(count: number): Petal[] {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.round((i / count) * 100 + (hash(i * 17 + 1) * 8 - 4)),
    delay: round(hash(i * 23 + 2) * 8),
    duration: round(10 + hash(i * 31 + 3) * 10),
    scale: round(0.5 + hash(i * 43 + 4) * 0.9),
    drift: round(hash(i * 59 + 5) * 120 - 60),
    opacity: round(0.35 + hash(i * 67 + 6) * 0.4),
  }));
}

export default function PetalField({ count = 14, className }: { count?: number; className?: string }) {
  const petals = generatePetals(count);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className ?? ""}`} aria-hidden="true">
      {petals.map((p) => (
        <PetalShape
          key={p.id}
          className="absolute top-0 text-rose animate-petal-fall"
          style={
            {
              left: `${p.left}%`,
              width: `${14 * p.scale}px`,
              height: `${14 * p.scale}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              opacity: p.opacity,
              "--drift": `${p.drift}px`,
            } as React.CSSProperties
          }
        />
      ))}
    </div>
  );
}
