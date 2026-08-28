import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";

export type AdminTable =
  | "devotionals"
  | "teachings"
  | "events"
  | "announcements"
  | "live_streams"
  | "prayer_requests"
  | "testimonies"
  | "community_posts"
  | "contact_info";

const COLUMNS: Record<AdminTable, string[]> = {
  devotionals: [
    "id", "title", "theme", "verse", "message", "application", "prayer",
    "memory_verse", "cover_url", "publish_at", "published",
  ],
  teachings: [
    "id", "title", "speaker", "topic", "series", "kind", "youtube_id",
    "media_url", "thumbnail_url", "duration", "description", "publish_at", "published",
  ],
  events: ["id", "title", "starts_at", "location", "event_type", "description", "link", "published"],
  announcements: ["id", "title", "body", "publish_at", "published"],
  live_streams: ["id", "title", "youtube_id", "starts_at", "is_live", "description"],
  prayer_requests: ["id", "name", "request", "kind", "status", "approved"],
  testimonies: ["id", "name", "message", "approved"],
  community_posts: ["id", "name", "body", "approved"],
  contact_info: ["id", "whatsapp_numbers", "email", "youtube", "facebook", "instagram", "address"],
};

const ORDER: Record<AdminTable, string> = {
  devotionals: "publish_at",
  teachings: "publish_at",
  events: "starts_at",
  announcements: "publish_at",
  live_streams: "starts_at",
  prayer_requests: "created_at",
  testimonies: "created_at",
  community_posts: "created_at",
  contact_info: "id",
};

export function isAdminTable(value: string): value is AdminTable {
  return Object.prototype.hasOwnProperty.call(COLUMNS, value);
}

export function orderColumn(table: AdminTable): string {
  return ORDER[table];
}

export function sanitizeRow(table: AdminTable, row: Record<string, unknown>) {
  const allowed = COLUMNS[table];
  const out: Record<string, unknown> = {};
  for (const key of allowed) {
    if (key in row && row[key] !== undefined) out[key] = row[key];
  }
  return out;
}

type AdminSession = { unlocked?: boolean };

function sessionConfig() {
  return {
    password: process.env["SESSION_SECRET"]!,
    name: "ngn-admin",
    maxAge: 60 * 60 * 8,
    cookie: { httpOnly: true, secure: true, sameSite: "lax" as const, path: "/" },
  };
}

export function getAdminSession() {
  return useSession<AdminSession>(sessionConfig());
}

export function passwordMatches(input: string): boolean {
  const expected = process.env["ADMIN_PASSWORD"];
  if (!expected) return false;
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session.data.unlocked) throw new Error("Admin session required");
  return session;
}
