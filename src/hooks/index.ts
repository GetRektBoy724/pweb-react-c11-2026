import { useEffect, useState } from "react";

/**
 * State yang otomatis dipersist ke localStorage setiap berubah.
 * Dipakai untuk `applications` dan `kaptenSkills` agar tidak hilang saat refresh.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored !== null) {
        return JSON.parse(stored) as T;
      }
    } catch {
      // localStorage rusak / JSON invalid -> pakai nilai awal.
    }
    return initialValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Kuota penuh / private mode: abaikan agar app tetap jalan.
    }
  }, [key, value]);

  return [value, setValue];
}

/**
 * Mengembalikan nilai yang hanya diperbarui setelah `delay` ms tanpa perubahan.
 * Dipakai untuk debounce keyword pencarian (400 ms).
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}
