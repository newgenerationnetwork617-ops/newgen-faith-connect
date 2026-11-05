import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Devotional = Tables<"devotionals">;
export type Teaching = Tables<"teachings">;
export type MinistryEvent = Tables<"events">;
export type Announcement = Tables<"announcements">;
export type Book = Tables<"books">;
export type AppBuild = Tables<"app_builds">;
export type PrayerRequest = Tables<"prayer_requests">;
export type ContactInfo = Tables<"contact_info">;

export const FALLBACK_CONTACT = {
  whatsapp_numbers: ["+2349159942740", "+2347018184333", "+2349066328985", "+2347046847936"],
  email: "newgenerationnetwork617@gmail.com",
  youtube: "https://www.youtube.com/@NGNOfficialTV",
  facebook: null as string | null,
  instagram: null as string | null,
  address: null as string | null,
};

const DEVOTIONAL_CACHE = "ngn-devotionals-offline-v1";

function readDevotionalCache(): Devotional[] {
  try {
    const raw = window.localStorage.getItem(DEVOTIONAL_CACHE);
    const parsed = raw ? (JSON.parse(raw) as Devotional[]) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function useDevotionals(limit = 20) {
  return useQuery({
    queryKey: ["devotionals", limit],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("devotionals")
          .select("*")
          .order("publish_at", { ascending: false })
          .limit(limit);
        if (error) throw error;
        const rows = data as Devotional[];
        if (typeof window !== "undefined" && rows.length > 0) {
          try {
            const merged = [...rows, ...readDevotionalCache().filter((c) => !rows.some((r) => r.id === c.id))]
              .sort((a, b) => b.publish_at.localeCompare(a.publish_at))
              .slice(0, 30);
            window.localStorage.setItem(DEVOTIONAL_CACHE, JSON.stringify(merged));
          } catch {
            /* storage unavailable */
          }
        }
        return rows;
      } catch (err) {
        // Offline or server unreachable: fall back to devotionals read earlier on this device.
        if (typeof window !== "undefined") {
          const cached = readDevotionalCache().slice(0, limit);
          if (cached.length > 0) return cached;
        }
        throw err;
      }
    },
  });
}

export function useLatestDevotional() {
  const query = useDevotionals(1);
  return { ...query, devotional: query.data?.[0] ?? null };
}

export function useTeachings(kind?: string) {
  return useQuery({
    queryKey: ["teachings", kind ?? "all"],
    queryFn: async () => {
      let q = supabase.from("teachings").select("*").order("publish_at", { ascending: false }).limit(200);
      if (kind) q = q.ilike("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return data as Teaching[];
    },
  });
}

export function useBooks() {
  return useQuery({
    queryKey: ["books"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("publish_at", { ascending: false })
        .limit(100);
      if (error) throw error;
      return data as Book[];
    },
  });
}

export function useLatestAppBuild() {
  return useQuery({
    queryKey: ["app_builds", "latest"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_builds")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(1);
      if (error) throw error;
      return (data as AppBuild[])[0] ?? null;
    },
  });
}

export function useEvents() {
  return useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("starts_at", { ascending: true })
        .limit(50);
      if (error) throw error;
      return data as MinistryEvent[];
    },
  });
}

export function useAnnouncements() {
  return useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("announcements")
        .select("*")
        .order("publish_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data as Announcement[];
    },
  });
}

export function usePrayerWall(kind: "prayer" | "praise") {
  return useQuery({
    queryKey: ["prayer_requests", kind],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .eq("kind", kind)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as PrayerRequest[];
    },
  });
}

export function useContactInfo() {
  const query = useQuery({
    queryKey: ["contact_info"],
    queryFn: async () => {
      const { data, error } = await supabase.from("contact_info").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as ContactInfo | null;
    },
  });
  return { ...query, contact: query.data ?? FALLBACK_CONTACT };
}

export async function submitPrayer(input: { name: string; request: string; kind: "prayer" | "praise" }) {
  const { error } = await supabase.from("prayer_requests").insert({
    name: input.name.slice(0, 80) || "Anonymous",
    request: input.request.slice(0, 2000),
    kind: input.kind,
  });
  if (error) throw error;
}

/** Timed private-link to a stored devotion book. Pass download to force a file download. */
export async function bookUrl(path: string, download?: string) {
  const { data, error } = await supabase.storage
    .from("books")
    .createSignedUrl(path, 60 * 60, download ? { download } : undefined);
  if (error) throw error;
  return data.signedUrl;
}

/** Timed private-link to the Android app package. */
export async function appFileUrl(path: string) {
  const { data, error } = await supabase.storage.from("app-files").createSignedUrl(path, 60 * 60, {
    download: "ngn-app.apk",
  });
  if (error) throw error;
  return data.signedUrl;
}

export function formatBytes(bytes: number | null) {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
