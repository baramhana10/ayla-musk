"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useUIStore } from "@/store/ui";
import { useLocale, useT } from "@/store/locale";

const easeLuxe = [0.22, 1, 0.36, 1] as const;
// Latin type has no shaping to protect, so it can rise in per *letter* for a
// finer cascade. Arabic is cursive — letters change glyph form depending on
// their neighbours, so splitting mid-word the same way would isolate every
// letter into its disconnected form. Arabic rises in per *word* instead,
// which keeps each word's internal shaping intact.
const WORDMARK_LTR = "AYLA MUSK".split("");
const WORDMARK_RTL = ["أيلا", "مَسك"];

/** ms from mount to the moment the curtain begins to part. */
const HOLD = 2400;
/** ms from the start of the exit to full teardown. */
const EXIT = 1250;

type Stage = "idle" | "playing" | "leaving" | "done";

/**
 * The house's one-time entrance. It fires once per browser session, which —
 * per the frequency gate — is what earns it motion this expressive; nothing
 * else on the site is allowed to be this theatrical. Set in the homepage's
 * white + warm-brown palette so the very first frame already reads as the
 * house's daylight mood rather than the noir identity used elsewhere.
 *
 * Whether it plays at all is decided *before* hydration by the inline script in
 * <IntroVeil />, which records its verdict as `intro-armed` on <html>. Reading
 * that class rather than re-deriving the answer from sessionStorage is the fix
 * for the loader hanging until a manual refresh: React's development
 * StrictMode mounts effects twice, and the previous version wrote its
 * "already shown" flag on the first mount, so the second mount took the
 * early-return branch and the curtain was left on screen with no exit timer
 * ever scheduled. The class is set once per page load, so both mounts now
 * agree, and the session flag is only written when the sequence has actually
 * finished playing.
 */
export default function IntroLoader() {
  const setIntroComplete = useUIStore((s) => s.setIntroComplete);
  const prefersReducedMotion = useReducedMotion();
  const t = useT();
  const locale = useLocale();
  const isArabic = locale === "ar";
  const wordmark = isArabic ? WORDMARK_RTL : WORDMARK_LTR;
  const [stage, setStage] = useState<Stage>("idle");
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const leavingRef = useRef(false);
  // Remembers the pre-hydration verdict so a StrictMode remount cannot re-read
  // (and mis-read) a class this component may already have cleaned up.
  const armedRef = useRef<boolean | null>(null);

  const finish = useCallback(() => {
    document.documentElement.classList.remove("intro-lock", "intro-armed");
    try {
      sessionStorage.setItem("ayla-intro-v2", "1");
    } catch {
      /* private mode — the intro simply plays again next load */
    }
    setStage("done");
  }, []);

  const leave = useCallback(() => {
    // Guarded by a ref rather than by reading state inside the updater: React
    // double-invokes updaters in StrictMode, so scheduling the teardown from
    // inside one would arm it twice.
    if (leavingRef.current) return;
    leavingRef.current = true;
    // The hero starts unveiling as the curtain *begins* to part, not after,
    // so the two read as one continuous reveal rather than two beats.
    setIntroComplete(true);
    document.documentElement.classList.remove("intro-lock");
    timers.current.push(setTimeout(finish, EXIT));
    setStage("leaving");
  }, [finish, setIntroComplete]);

  useEffect(() => {
    if (armedRef.current === null) {
      armedRef.current = document.documentElement.classList.contains("intro-armed");
    }
    const armed = armedRef.current;

    if (!armed) {
      setIntroComplete(true);
      document.documentElement.classList.remove("intro-lock", "intro-armed");
      return;
    }

    document.documentElement.classList.add("intro-lock");
    setStage("playing");
    // Hand the veil off to React only once our own overlay has painted over it.
    const raf = requestAnimationFrame(() =>
      requestAnimationFrame(() => document.documentElement.classList.remove("intro-armed"))
    );
    timers.current.push(setTimeout(leave, HOLD));

    const captured = timers.current;
    return () => {
      cancelAnimationFrame(raf);
      captured.forEach(clearTimeout);
      captured.length = 0;
      document.documentElement.classList.remove("intro-lock");
    };
  }, [leave, setIntroComplete]);

  // Escape hatch: any deliberate input skips ahead rather than trapping
  // someone who has seen it before in a private window.
  useEffect(() => {
    if (stage !== "playing") return;
    const skip = () => leave();
    window.addEventListener("keydown", skip);
    window.addEventListener("wheel", skip, { passive: true });
    window.addEventListener("touchstart", skip, { passive: true });
    return () => {
      window.removeEventListener("keydown", skip);
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
    };
  }, [stage, leave]);

  if (stage === "idle" || stage === "done") return null;

  const leaving = stage === "leaving";
  const panel = { duration: 1.05, ease: easeLuxe, delay: 0.2 };

  return (
    <div
      className="fixed inset-0 z-[100] cursor-pointer select-none"
      aria-hidden="true"
      onClick={leave}
    >
      {/* Curtain — two solid panels that draw apart from a lit seam, so the
          hero is revealed through a widening aperture instead of a cross-fade. */}
      <motion.div
        className="grain-warm absolute inset-x-0 top-0 h-1/2 overflow-hidden bg-[radial-gradient(140%_120%_at_50%_100%,#f6ead9_0%,#fbf6ef_58%,#fffdfa_100%)]"
        animate={{ y: leaving ? "-101%" : 0 }}
        transition={panel}
      />
      <motion.div
        className="grain-warm absolute inset-x-0 bottom-0 h-1/2 overflow-hidden bg-[radial-gradient(140%_120%_at_50%_0%,#f6ead9_0%,#fbf6ef_58%,#fffdfa_100%)]"
        animate={{ y: leaving ? "101%" : 0 }}
        transition={panel}
      />

      {/* The seam itself: a bronze hairline that flares as the panels release. */}
      <motion.div
        className="rule-bronze absolute inset-x-0 top-1/2 -translate-y-1/2"
        initial={{ opacity: 0, scaleX: 0.2 }}
        animate={
          leaving
            ? { opacity: [0, 1, 0], scaleX: [0.2, 1, 1], filter: ["blur(0px)", "blur(0px)", "blur(6px)"] }
            : { opacity: 0, scaleX: 0.2 }
        }
        transition={{ duration: 0.9, ease: easeLuxe, times: [0, 0.35, 1] }}
      />

      {/* Slow, out-of-focus colour behind the mark — keeps a large cream field
          from reading as flat white. */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          animate={{ opacity: leaving ? 0 : 1 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0"
        >
          <div className="animate-aurora absolute left-1/2 top-1/2 h-[38rem] w-[38rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--hw-tan)]/28 blur-[120px]" />
          <div className="animate-aurora-slow absolute left-[32%] top-[38%] h-[26rem] w-[26rem] rounded-full bg-[var(--hw-brown-light)]/18 blur-[110px]" />
        </motion.div>
      </div>

      {/* Mark — exits faster and subtler than it entered, and clears the seam
          before the panels move. */}
      <motion.div
        className="absolute inset-0 flex flex-col items-center justify-center"
        animate={{
          opacity: leaving ? 0 : 1,
          scale: leaving ? 1.06 : 1,
          filter: leaving ? "blur(10px)" : "blur(0px)",
        }}
        transition={{ duration: 0.45, ease: easeLuxe }}
      >
        {/* Bronze ring, drawn rather than faded. */}
        <svg
          viewBox="0 0 200 200"
          className="pointer-events-none absolute h-[19rem] w-[19rem] sm:h-[23rem] sm:w-[23rem]"
        >
          <motion.circle
            cx="100"
            cy="100"
            r="96"
            fill="none"
            stroke="url(#ayla-ring)"
            strokeWidth="0.6"
            initial={{ pathLength: 0, opacity: 0, rotate: -90 }}
            animate={{ pathLength: 1, opacity: 1, rotate: -90 }}
            transition={{ duration: 1.8, ease: easeLuxe, delay: 0.1 }}
            style={{ transformOrigin: "50% 50%" }}
          />
          <defs>
            <linearGradient id="ayla-ring" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8a6244" stopOpacity="0.18" />
              <stop offset="45%" stopColor="#c9a377" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#8a6244" stopOpacity="0.18" />
            </linearGradient>
          </defs>
        </svg>

        <motion.span
          initial={{ opacity: 0, letterSpacing: "1.4em" }}
          animate={{ opacity: 1, letterSpacing: "0.42em" }}
          transition={{ delay: 0.35, duration: 1.1, ease: easeLuxe }}
          className="relative ps-[0.42em] text-[9px] uppercase text-[var(--hw-brown)] sm:text-[10px]"
        >
          {t("intro.fragranceHouse")}
        </motion.span>

        {/* Rises in per letter (Latin) or per word (Arabic) — see the note by
            WORDMARK_RTL above for why Arabic can't split mid-word. */}
        <h1
          className={`relative mt-4 flex overflow-hidden pb-2 font-display text-[2.1rem] text-[var(--hw-espresso)] sm:text-[3.4rem] ${
            isArabic ? "tracking-normal" : "tracking-[0.22em]"
          }`}
        >
          {wordmark.map((unit, i) => (
            <motion.span
              key={i}
              initial={{ y: "110%", opacity: 0, filter: "blur(8px)" }}
              animate={{ y: "0%", opacity: 1, filter: "blur(0px)" }}
              transition={{ delay: 0.6 + i * (isArabic ? 0.16 : 0.06), duration: 0.9, ease: easeLuxe }}
              className={unit === " " ? "inline-block w-[0.34em]" : "inline-block"}
            >
              {unit === " " ? " " : isArabic && i < wordmark.length - 1 ? `${unit} ` : unit}
            </motion.span>
          ))}

          {/* One-shot foil sweep once the letters have settled. */}
          {!prefersReducedMotion && (
            <motion.span
              className="pointer-events-none absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-[var(--hw-tan)]/70 to-transparent"
              style={{ mixBlendMode: "multiply" }}
              initial={{ x: "-160%", skewX: -18 }}
              animate={{ x: "460%", skewX: -18 }}
              transition={{ delay: 1.5, duration: 1.2, ease: easeLuxe }}
            />
          )}
        </h1>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 1.35, duration: 0.8, ease: easeLuxe }}
          className="rule-bronze relative mt-5 w-40 origin-center"
        />

        <motion.div
          initial={{ scale: 0.7, opacity: 0, rotate: 45 }}
          animate={{ scale: 1, opacity: 1, rotate: 45 }}
          transition={{ delay: 1.6, duration: 0.6, ease: easeLuxe }}
          className="relative mt-5 h-1.5 w-1.5 bg-[var(--hw-brown-deep)]"
        />

        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.05, duration: 0.6 }}
          className="absolute bottom-10 text-[9px] uppercase tracking-[0.4em] text-[var(--hw-brown)]/55"
        >
          {t("intro.est")}
        </motion.span>
      </motion.div>
    </div>
  );
}
