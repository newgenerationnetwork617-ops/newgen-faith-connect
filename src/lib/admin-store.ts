// Simple client-side content store for the admin dashboard.
// Persisted in localStorage. Replace with Lovable Cloud when backend is enabled.
import { useEffect, useState } from "react";

export type Devotional = {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  verse: string;
  message: string;
  prayer: string;
};

export type Meeting = {
  id: string;
  title: string;
  date: string; // ISO
  location: string;
  link?: string;
  description?: string;
};

export type PrayerEntry = {
  id: string;
  name: string;
  request: string;
  createdAt: string;
  kind: "prayer" | "praise";
  status: "new" | "read" | "archived";
};

export type Testimony = {
  id: string;
  name: string;
  message: string;
  createdAt: string;
  approved: boolean;
};

const KEYS = {
  devotionals: "ngn.devotionals",
  meetings: "ngn.meetings",
  prayers: "ngn.prayers",
  testimonies: "ngn.testimonies",
  adminSession: "ngn.admin.session",
} as const;

export const ADMIN_PASSWORD = "bengidopetos";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new StorageEvent("storage", { key }));
}

function useStore<T>(key: string, initial: T) {
  const [state, setState] = useState<T>(() => read(key, initial));
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) setState(read(key, initial));
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const setAndPersist = (v: T | ((prev: T) => T)) => {
    setState((prev) => {
      const next = typeof v === "function" ? (v as (p: T) => T)(prev) : v;
      write(key, next);
      return next;
    });
  };
  return [state, setAndPersist] as const;
}

export const useDevotionals = () => useStore<Devotional[]>(KEYS.devotionals, []);
export const useMeetings = () => useStore<Meeting[]>(KEYS.meetings, []);
export const usePrayers = () => useStore<PrayerEntry[]>(KEYS.prayers, []);
export const useTestimonies = () => useStore<Testimony[]>(KEYS.testimonies, []);

export function submitPrayer(entry: Omit<PrayerEntry, "id" | "createdAt" | "status">) {
  const list = read<PrayerEntry[]>(KEYS.prayers, []);
  const next: PrayerEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    status: "new",
  };
  write(KEYS.prayers, [next, ...list]);
  return next;
}

export function submitTestimony(entry: Omit<Testimony, "id" | "createdAt" | "approved">) {
  const list = read<Testimony[]>(KEYS.testimonies, []);
  const next: Testimony = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    approved: false,
  };
  write(KEYS.testimonies, [next, ...list]);
  return next;
}

// Admin session (very light gate; not a security boundary).
export function isAdminUnlocked(): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(KEYS.adminSession) === "unlocked";
}
export function unlockAdmin(password: string): boolean {
  if (password !== ADMIN_PASSWORD) return false;
  sessionStorage.setItem(KEYS.adminSession, "unlocked");
  return true;
}
export function lockAdmin() {
  sessionStorage.removeItem(KEYS.adminSession);
}
