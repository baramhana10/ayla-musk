"use client";

import { useEffect, useState } from "react";
import { couponsApi, type CouponDto } from "./api";

/** Never use a cached/static discount as checkout authority. */
export function useValidatedCoupon(code: string | null) {
  const [state, setState] = useState<{ code: string | null; coupon: CouponDto | null; status: "ready" | "loading" | "invalid" | "error" }>({ code: null, coupon: null, status: "ready" });
  useEffect(() => {
    if (!code) return;
    let cancelled = false;
    async function validate() {
      setState({ code, coupon: null, status: "loading" });
      try {
        const result = await couponsApi.validate(code!);
        if (!cancelled) setState({ code, coupon: result.valid ? result.coupon ?? null : null, status: result.valid ? "ready" : "invalid" });
      } catch {
        if (!cancelled) setState({ code, coupon: null, status: "error" });
      }
    }
    void validate();
    window.addEventListener("focus", validate);
    return () => { cancelled = true; window.removeEventListener("focus", validate); };
  }, [code]);
  if (!code) return { coupon: null, status: "ready" as const };
  if (state.code !== code) return { coupon: null, status: "loading" as const };
  return { coupon: state.coupon, status: state.status };
}
