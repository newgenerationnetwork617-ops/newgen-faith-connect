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

export const sendChatMessage = createServerFn({ method: "POST" })
  .validator((d: { name: string; body: string; token: string }) => ({
    name: clean(d?.name, 60) || "Believer",
    body: clean(d?.body, 1000),
    token: checkToken(d?.token),
  }))
  .handler(async ({ data }) => {
    if (!data.body) throw new Error("Message is empty");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("chat_messages")
      .insert({ name: data.name, body: data.body, author_hash: await hashToken(data.token) })
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: row.id };
  });

export const editChatMessage = createServerFn({ method: "POST" })
  .validator((d: { id: string; body: string; token: string }) => ({
    id: clean(d?.id, 64),
    body: clean(d?.body, 1000),
    token: checkToken(d?.token),
  }))
  .handler(async ({ data }) => {
    if (!data.body) throw new Error("Message is empty");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
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
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("chat_messages")
      .delete()
      .eq("id", data.id)
      .eq("author_hash", await hashToken(data.token))
      .select("id");
    if (error) throw new Error(error.message);
    if (!rows?.length) throw new Error("You can only delete your own messages");
    return { ok: true as const };
  });
