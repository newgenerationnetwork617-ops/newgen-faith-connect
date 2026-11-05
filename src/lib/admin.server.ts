import { useSession } from "@tanstack/react-start/server";
import { createHash, timingSafeEqual } from "node:crypto";
import { youtubeId } from "./youtube";

export type AdminTable =
  | "devotionals"
  | "teachings"
  | "books"
  | "app_builds"
  | "events"
  | "announcements"
  | "prayer_requests"
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
  books: ["id", "title", "author", "description", "file_path", "cover_url", "pages", "publish_at", "published"],
  app_builds: ["id", "version_name", "notes", "file_path", "file_size", "published", "created_at"],
  events: ["id", "title", "starts_at", "location", "event_type", "description", "link", "published"],
  announcements: ["id", "title", "body", "publish_at", "published"],
  prayer_requests: ["id", "name", "request", "kind", "status", "approved"],
  contact_info: ["id", "whatsapp_numbers", "email", "youtube", "facebook", "instagram", "address"],
};

const ORDER: Record<AdminTable, string> = {
  devotionals: "publish_at",
  teachings: "publish_at",
  books: "publish_at",
  app_builds: "created_at",
  events: "starts_at",
  announcements: "publish_at",
  prayer_requests: "created_at",
  contact_info: "id",
};

/** Which storage bucket backs each table's file_path column, if any. */
export const FILE_BUCKETS: Partial<Record<AdminTable, string>> = {
  books: "books",
  app_builds: "app-files",
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
  if (typeof out.youtube_id === "string" && out.youtube_id) {
    out.youtube_id = youtubeId(out.youtube_id) ?? out.youtube_id;
  }
  if (typeof out.kind === "string") out.kind = out.kind.trim().toLowerCase() || "video";
  if (typeof out.file_path === "string") out.file_path = out.file_path.trim();
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
