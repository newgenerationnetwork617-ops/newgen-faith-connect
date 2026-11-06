import { createFileRoute } from '@tanstack/react-router'

const BOOK_MAX = 100 * 1024 * 1024;
const APP_MAX = 200 * 1024 * 1024;

/**
 * Admin-only file uploads (devotion book PDFs and the Android app package).
 * The caller must already have a valid admin session cookie; the handler
 * re-verifies it before anything is written to storage.
 */
export const Route = createFileRoute("/api/public/admin-upload")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { requireAdmin } = await import("@/lib/admin.server");
        try {
          await requireAdmin();
        } catch {
          return new Response("Admin session required", { status: 401 });
        }

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return new Response("Invalid upload", { status: 400 });
        }

        const kind = String(form.get("kind") ?? "");
        const file = form.get("file");
        if (!(file instanceof File)) return new Response("No file attached", { status: 400 });

        const isBook = kind === "book";
        const isApp = kind === "app";
        if (!isBook && !isApp) return new Response("Unknown upload kind", { status: 400 });

        const name = file.name.toLowerCase();
        if (isBook && !name.endsWith(".pdf") && file.type !== "application/pdf") {
          return new Response("Only PDF files are allowed for books", { status: 400 });
        }
        if (file.size > (isBook ? BOOK_MAX : APP_MAX)) {
          return new Response(isBook ? "PDF is too large (max 100MB)" : "App file is too large (max 200MB)", {
            status: 413,
          });
        }

        const rawExt = name.includes(".") ? name.split(".").pop()! : "";
        const ext = /^[a-z0-9]{2,5}$/.test(rawExt) ? rawExt : isBook ? "pdf" : "apk";
        const bucket = isBook ? "books" : "app-files";
        const path = isBook ? `books/${crypto.randomUUID()}.${ext}` : `app/ngn-app-${crypto.randomUUID()}.${ext}`;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
        if (error) return new Response(error.message, { status: 500 });

        return Response.json({ bucket, path, size: file.size });
      },
    },
  },
});
