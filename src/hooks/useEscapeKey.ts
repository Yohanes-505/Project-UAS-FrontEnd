"use client";

import { useEffect, useRef } from "react";

/** Jalankan `handler` saat tombol Escape ditekan, hanya ketika `active` true. */
export function useEscapeKey(handler: () => void, active = true) {
  const handlerRef = useRef(handler);
  useEffect(() => {
    handlerRef.current = handler;
  });

  useEffect(() => {
    if (!active) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") handlerRef.current();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active]);
}
