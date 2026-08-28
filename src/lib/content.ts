import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type Devotional = Tables<"devotionals">;
export type Teaching = Tables<"teachings">;
export type MinistryEvent = Tables<"events">;
export type Announcement = Tables<"announcements">;
export type LiveStream = Tables<"live_streams">;
export type PrayerRequest = Tables<"prayer_requests">;
export type Testimony = Tables<"testimonies">;
export type CommunityPost = Tables<"community_posts">;
export type ContactInfo = Tables<"contact_info">;

export const FALLBACK_CONTACT = {
  whatsapp_numbers: ["+2349159942740", "+2347018184333", "+2349066328985", "+2347046847936"],
  email: "newgenerationnetwork617@gmail.com",
  youtube: "https://www.youtube.com/@NGNOfficialTV",
  facebook: null as string | null,
  instagram: null as string | null,
  address: null as string | null,
};

export function useDevotionals(limit = 20) {
  return useQuery({
    queryKey: ["devotionals", limit],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("devotionals")
        .select("*")
        .order("publish_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return data as Devotional[];
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
      let q = supabase.from("teachings").select("*").order("publish_at", { ascending: false }).limit(60);
      if (kind) q = q.eq("kind", kind);
      const { data, error } = await q;
      if (error) throw error;
      return data as Teaching[];
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

export function useLiveStream() {
  return useQuery({
    queryKey: ["live_streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("starts_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data as LiveStream[];
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

export function useTestimonies() {
  return useQuery({
    queryKey: ["testimonies"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("testimonies")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as Testimony[];
    },
  });
}

export function useCommunityPosts() {
  return useQuery({
    queryKey: ["community_posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data as CommunityPost[];
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

export async function submitTestimony(input: { name: string; message: string }) {
  const { error } = await supabase.from("testimonies").insert({
    name: input.name.slice(0, 80) || "Anonymous",
    message: input.message.slice(0, 4000),
  });
  if (error) throw error;
}

export async function submitCommunityPost(input: { name: string; body: string }) {
  const { error } = await supabase.from("community_posts").insert({
    name: input.name.slice(0, 80) || "Believer",
    body: input.body.slice(0, 2000),
  });
  if (error) throw error;
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  });
}
