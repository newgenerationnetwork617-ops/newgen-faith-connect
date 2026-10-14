import { createServerFn } from "@tanstack/react-start";

async function hashToken(token: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

function clean(v: unknown, max: number) {
  return String(v ?? "").trim().slice(0, max);
}

function checkToken(t: unknown) {
  const token = String(t ?? "");
  if (token.length < 20 || token.length > 200) throw new Error("Invalid device key");
  return token;
}

const UUID = /^[0-9a-f-]{36}$/i;
const BUCKET = "chat-voice";
const MAX_AUDIO_B64 = 4_500_000; // ~3.3 MB

async function admin() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  return supabaseAdmin;
}

async function ensureMember(token: string, name?: string) {
  const db = await admin();
  const hash = await hashToken(token);
  const patch: { author_hash: string; last_seen: string; name?: string } = { author_hash: hash, last_seen: new Date().toISOString() };
  if (name) patch.name = name;
  const { data, error } = await db.from("chat_members").upsert(patch, { onConflict: "author_hash" }).select("id, name").single();
  if (error) throw new Error(error.message);
  return { id: data.id as string, name: data.name as string, hash };
}

async function signPaths(paths: string[]) {
  if (!paths.length) return {} as Record<string, string>;
  const db = await admin();
  const { data } = await db.storage.from(BUCKET).createSignedUrls(paths, 60 * 60 * 6);
  const out: Record<string, string> = {};
  for (const r of data ?? []) if (r.path && r.signedUrl) out[r.path] = r.signedUrl;
  return out;
}

export const joinChat = createServerFn({ method: "POST" })
  .validator((d: { token: string; name?: string }) => ({ token: checkToken(d?.token), name: clean(d?.name, 60) }))
  .handler(async ({ data }) => {
    const m = await ensureMember(data.token, data.name || undefined);
    return { memberId: m.id };
  });

export const listMembers = createServerFn({ method: "GET" }).handler(async () => {
  const db = await admin();
  const { data, error } = await db.from("chat_members").select("id, name, last_seen").order("last_seen", { ascending: false }).limit(200);
  if (error) throw new Error(error.message);
  return (data ?? []) as { id: string; name: string; last_seen: string }[];
});

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((d: { name: string; body?: string; token: string; audio?: string; audioType?: string; seconds?: number; to?: string | null }) => {
    const audio = d?.audio ? String(d.audio) : "";
    if (audio.length > MAX_AUDIO_B64) throw new Error("Voice note is too long");
    const to = d?.to ? String(d.to) : null;
    if (to && !UUID.test(to)) throw new Error("Invalid recipient");
    return {
      name: clean(d?.name, 60) || "Believer",
      body: clean(d?.body, 1000),
      token: checkToken(d?.token),
      audio,
      audioType: /^audio\/[\w.+-]+(;.*)?$/.test(String(d?.audioType ?? "")) ? String(d.audioType).split(";")[0]! : "audio/webm",
      seconds: Math.max(0, Math.min(600, Math.round(Number(d?.seconds) || 0))),
      to,
    };
  })
  .handler(async ({ data }) => {
    if (!data.body && !data.audio) throw new Error("Message is empty");
    const db = await admin();
    const me = await ensureMember(data.token, data.name);
    let audio_path: string | null = null;
    if (data.audio) {
      const bin = Uint8Array.from(atob(data.audio), (c) => c.charCodeAt(0));
      const ext = data.audioType.includes("mp4") ? "m4a" : data.audioType.includes("ogg") ? "ogg" : "webm";
      audio_path = `${me.id}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await db.storage.from(BUCKET).upload(audio_path, bin, { contentType: data.audioType });
      if (upErr) throw new Error(upErr.message);
    }
    const { data: row, error } = await db
      .from("chat_messages")
      .insert({
        name: data.name,
        body: data.body,
        author_hash: me.hash,
        sender_id: me.id,
        recipient_id: data.to,
        audio_path,
        audio_seconds: data.audio ? data.seconds : null,
      })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id as string };
  });

/** Signed playback links for voice notes in the public room. */
export const voiceUrls = createServerFn({ method: "POST" })
  .validator((d: { ids: string[] }) => ({ ids: (Array.isArray(d?.ids) ? d.ids : []).filter((i) => UUID.test(String(i))).slice(0, 200) }))
  .handler(async ({ data }) => {
    if (!data.ids.length) return {} as Record<string, string>;
    const db = await admin();
    const { data: rows } = await db
      .from("chat_messages")
      .select("id, audio_path")
      .in("id", data.ids)
      .is("recipient_id", null)
      .eq("hidden", false)
      .not("audio_path", "is", null);
    const signed = await signPaths((rows ?? []).map((r) => r.audio_path as string));
    const out: Record<string, string> = {};
    for (const r of rows ?? []) if (signed[r.audio_path as string]) out[r.id as string] = signed[r.audio_path as string]!;
    return out;
  });

export type PrivateMsg = {
  id: string; name: string; body: string; edited_at: string | null; created_at: string;
  sender_id: string | null; audio_seconds: number | null; audio_url: string | null;
};

export const listPrivate = createServerFn({ method: "POST" })
  .validator((d: { token: string; with: string }) => {
    if (!UUID.test(String(d?.with))) throw new Error("Invalid member");
    return { token: checkToken(d?.token), with: String(d.with) };
  })
  .handler(async ({ data }) => {
    const db = await admin();
    const me = await ensureMember(data.token);
    const { data: rows, error } = await db
      .from("chat_messages")
      .select("id, name, body, edited_at, created_at, sender_id, audio_path, audio_seconds")
      .eq("hidden", false)
      .or(`and(sender_id.eq.${me.id},recipient_id.eq.${data.with}),and(sender_id.eq.${data.with},recipient_id.eq.${me.id})`)
      .order("created_at", { ascending: false })
      .limit(150);
    if (error) throw new Error(error.message);
    const signed = await signPaths((rows ?? []).filter((r) => r.audio_path).map((r) => r.audio_path as string));
    return (rows ?? []).reverse().map((r) => ({
      id: r.id, name: r.name, body: r.body, edited_at: r.edited_at, created_at: r.created_at,
      sender_id: r.sender_id, audio_seconds: r.audio_seconds,
      audio_url: r.audio_path ? signed[r.audio_path] ?? null : null,
    })) as PrivateMsg[];
  });

/** People who have messaged me privately, newest first. */
export const listInbox = createServerFn({ method: "POST" })
  .validator((d: { token: string }) => ({ token: checkToken(d?.token) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const me = await ensureMember(data.token);
    const { data: rows } = await db
      .from("chat_messages")
      .select("sender_id, name, created_at")
      .eq("recipient_id", me.id)
      .eq("hidden", false)
      .order("created_at", { ascending: false })
      .limit(200);
    const seen = new Map<string, { id: string; name: string; last: string }>();
    for (const r of rows ?? []) if (r.sender_id && !seen.has(r.sender_id)) seen.set(r.sender_id, { id: r.sender_id, name: r.name, last: r.created_at });
    return [...seen.values()];
  });

export const editChatMessage = createServerFn({ method: "POST" })
  .validator((d: { id: string; body: string; token: string }) => ({
    id: clean(d?.id, 64),
    body: clean(d?.body, 1000),
    token: checkToken(d?.token),
  }))
  .handler(async ({ data }) => {
    if (!data.body) throw new Error("Message is empty");
    const db = await admin();
    const { data: rows, error } = await db
      .from("chat_messages")
      .update({ body: data.body, edited_at: new Date().toISOString() })
      .eq("id", data.id)
      .eq("author_hash", await hashToken(data.token))
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("You can only edit your own messages");
    return { ok: true as const };
  });

export const deleteChatMessage = createServerFn({ method: "POST" })
  .validator((d: { id: string; token: string }) => ({ id: clean(d?.id, 64), token: checkToken(d?.token) }))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: rows, error } = await db
      .from("chat_messages")
      .delete()
      .eq("id", data.id)
      .eq("author_hash", await hashToken(data.token))
      .select("id, audio_path");
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("You can only delete your own messages");
    if (rows[0]!.audio_path) await db.storage.from(BUCKET).remove([rows[0]!.audio_path as string]);
    return { ok: true as const };
  });
