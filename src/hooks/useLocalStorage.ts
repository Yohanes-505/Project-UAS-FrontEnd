"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import {
  LOCAL_STORAGE_EVENT,
  readStorage,
  writeStorage,
  type LocalStorageEventDetail,
} from "@/lib/storage";

type SetValue<T> = (next: T | ((prev: T) => T)) => void;

/**
 * State React yang tersimpan di localStorage.
 *
 *   const [orders, setOrders, ready] = useLocalStorage(STORAGE_KEYS.orders, ORDER_DATA_DEFAULT);
 *
 * - Render pertama selalu memakai `initialValue` (aman untuk SSR),
 *   lalu langsung diganti isi localStorage setelah halaman tampil.
 * - `ready` bernilai true setelah localStorage terbaca.
 * - Semua komponen yang memakai key yang sama ikut ter-update,
 *   baik di tab yang sama maupun di tab lain (mis. landing <-> admin).
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, SetValue<T>, boolean] {
  const sourceId = useId();
  const initialRef = useRef(initialValue);
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);
  const valueRef = useRef(value);

  useEffect(() => {
    const sync = () => {
      const next = readStorage(key, initialRef.current);
      valueRef.current = next;
      setValue(next);
    };
    sync();
    setReady(true);

    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) sync();
    };
    const onLocal = (event: Event) => {
      const detail = (event as CustomEvent<LocalStorageEventDetail>).detail;
      if (detail?.key === key && detail.source !== sourceId) sync();
    };

    window.addEventListener("storage", onStorage);
    window.addEventListener(LOCAL_STORAGE_EVENT, onLocal);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_EVENT, onLocal);
    };
  }, [key, sourceId]);

  const update = useCallback<SetValue<T>>(
    (next) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(valueRef.current) : next;
      valueRef.current = resolved;
      setValue(resolved);
      writeStorage(key, resolved, sourceId);
    },
    [key, sourceId],
  );

  return [value, update, ready];
}
