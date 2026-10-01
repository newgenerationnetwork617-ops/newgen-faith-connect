import { createServerFn } from "@tanstack/react-start";

export type AdminRow = Record<string, string | number | boolean | string[] | null>;

export const adminLogin = createServerFn({ method: "POST" })
  .validator((data: { password: string }) => ({ password: String(data?.password ?? "") }))
  .handler(async ({ data }) => {
    const { passwordMatches, getAdminSession } = await import("./admin.server");
    if (!passwordMatches(data.password)) return { ok: false as const };
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const adminLogout = createServerFn({ method: "POST" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  await session.clear();
  return { ok: true as const };
});

export const adminStatus = createServerFn({ method: "GET" }).handler(async () => {
  const { getAdminSession } = await import("./admin.server");
  const session = await getAdminSession();
  return { unlocked: session.data.unlocked === true };
});

export const adminFetch = createServerFn({ method: "POST" })
  .validator((data: { table: string }) => ({ table: String(data?.table ?? "") }))
  .handler(async ({ data }) => {
    const { requireAdmin, isAdminTable, orderColumn } = await import("./admin.server");
    await requireAdmin();
    if (!isAdminTable(data.table)) throw new Error("Unknown table");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from(data.table)
      .select("*")
      .order(orderColumn(data.table), { ascending: false })
      .limit(200);
    if (error) throw new Error(error.message);
    return { rows: (rows ?? []) as AdminRow[] };
  });

export const adminUpsert = createServerFn({ method: "POST" })
  .validator((data: { table: string; row: AdminRow }) => ({
    table: String(data?.table ?? ""),
    row: (data?.row ?? {}) as AdminRow,
  }))
  .handler(async ({ data }) => {
    const { requireAdmin, isAdminTable, sanitizeRow } = await import("./admin.server");
    await requireAdmin();
    if (!isAdminTable(data.table)) throw new Error("Unknown table");
    const payload = sanitizeRow(data.table, data.row);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from(data.table)
      .upsert(payload, { onConflict: "id" })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return { row: row as AdminRow };
  });

export const adminDelete = createServerFn({ method: "POST" })
  .validator((data: { table: string; id: string }) => ({
    table: String(data?.table ?? ""),
    id: String(data?.id ?? ""),
  }))
  .handler(async ({ data }) => {
    const { requireAdmin, isAdminTable } = await import("./admin.server");
    await requireAdmin();
    if (!isAdminTable(data.table)) throw new Error("Unknown table");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from(data.table).delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
