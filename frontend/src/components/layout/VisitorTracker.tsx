"use client";

import { useEffect } from "react";
import { analyticsApi } from "@/lib/api";

const STORAGE_KEY = "ayla-visitor-id";
const INTERVAL = 5 * 60 * 1000;

export default function VisitorTracker() {
  useEffect(() => {
    let visitorId: string;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      visitorId = saved && /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(saved)
        ? saved : crypto.randomUUID();
      localStorage.setItem(STORAGE_KEY, visitorId);
    } catch {
      // Without persistent storage we cannot reliably deduplicate browsers.
      return;
    }
    let pending = false;
    let lastSent = 0;
    const track = async () => {
      if (document.visibilityState !== "visible" || pending || Date.now() - lastSent < INTERVAL) return;
      pending = true;
      try {
        await analyticsApi.visit(visitorId);
        lastSent = Date.now();
      } catch {
        // Analytics failures must not interrupt shopping; retry on the next tick.
      } finally {
        pending = false;
      }
    };
    void track();
    const timer = window.setInterval(track, INTERVAL);
    document.addEventListener("visibilitychange", track);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", track);
    };
  }, []);
  return null;
}
