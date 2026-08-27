"use client";

import { useEffect, useState } from "react";

export function useHasMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- canonical client-mount detection idiom, must run post-hydration
    setMounted(true);
  }, []);
  return mounted;
}
