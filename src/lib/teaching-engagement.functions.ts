import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const identity = z.object({ teachingId: z.string().uuid(), token: z.string().regex(/^[a-f0-9]{48}$/) });

async function ownerHash(token: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}

export const getMyTeachingLike = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof identity>) => identity.parse(input))
  .handler(async ({ data }) => {
    const hash = await ownerHash(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: like, error } = await supabaseAdmin.from("teaching_likes").select("teaching_id").eq("teaching_id", data.teachingId).eq("author_hash", hash).maybeSingle();
    if (error) throw new Error("Unable to load your reaction");
    return { liked: !!like };
  });

export const setTeachingLike = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof identity> & { liked: boolean }) => identity.extend({ liked: z.boolean() }).parse(input))
  .handler(async ({ data }) => {
    const hash = await ownerHash(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: teaching, error: readError } = await supabaseAdmin.from("teachings").select("id").eq("id", data.teachingId).eq("published", true).lte("publish_at", new Date().toISOString()).maybeSingle();
    if (readError || !teaching) throw new Error("Teaching is unavailable");
    const query = data.liked
      ? supabaseAdmin.from("teaching_likes").upsert({ teaching_id: data.teachingId, author_hash: hash }, { onConflict: "teaching_id,author_hash", ignoreDuplicates: true })
      : supabaseAdmin.from("teaching_likes").delete().eq("teaching_id", data.teachingId).eq("author_hash", hash);
    const { error } = await query;
    if (error) throw new Error("Unable to save your reaction");
    return { liked: data.liked };
  });

export const addTeachingComment = createServerFn({ method: "POST" })
  .validator((input: z.infer<typeof identity> & { name: string; body: string }) => identity.extend({ name: z.string().trim().min(1).max(60), body: z.string().trim().min(1).max(1000) }).parse(input))
  .handler(async ({ data }) => {
    const hash = await ownerHash(data.token);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: teaching, error: readError } = await supabaseAdmin.from("teachings").select("id").eq("id", data.teachingId).eq("published", true).lte("publish_at", new Date().toISOString()).maybeSingle();
    if (readError || !teaching) throw new Error("Teaching is unavailable");
    const { count, error: countError } = await supabaseAdmin.from("teaching_comments").select("id", { count: "exact", head: true }).eq("author_hash", hash).gte("created_at", new Date(Date.now() - 60000).toISOString());
    if (countError) throw new Error("Unable to post comment");
    if ((count ?? 0) >= 5) throw new Error("Please wait a minute before commenting again");
    const { data: comment, error } = await supabaseAdmin.from("teaching_comments").insert({ teaching_id: data.teachingId, author_hash: hash, name: data.name, body: data.body }).select("id").single();
    if (error) throw new Error("Unable to post comment");
    return { id: comment.id };
  });