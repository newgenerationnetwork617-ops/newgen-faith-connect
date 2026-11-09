import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/public/file-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const kind = url.searchParams.get("kind");
        const path = url.searchParams.get("path");
        if ((kind !== "book" && kind !== "app") || !path || path.length > 512) {
          return new Response("File not found", { status: 404 });
        }

        const table = kind === "book" ? "books" : "app_builds";
        const bucket = kind === "book" ? "books" : "app-files";
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: published, error: lookupError } = await supabaseAdmin
          .from(table)
          .select("id")
          .eq("file_path", path)
          .eq("published", true)
          .limit(1)
          .maybeSingle();

        if (lookupError) {
          console.error("Could not check whether a download is published:", lookupError.message);
          return new Response("Download unavailable", { status: 503 });
        }
        if (!published) return new Response("File not found", { status: 404 });

        const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUrl(path, 60 * 60);
        if (error || !data) {
          console.error("Could not create a published download link:", error?.message);
          return new Response("Download unavailable", { status: 503 });
        }

        return Response.json({ url: data.signedUrl }, {
          headers: { "Cache-Control": "private, no-store" },
        });
      },
    },
  },
});