import { createFileRoute } from '@tanstack/react-router'

const BOOK_MAX = 100 * 1024 * 1024;
const APP_MAX = 200 * 1024 * 1024;

/**
 * Creates a short-lived, admin-authorized upload token. Large file bytes then
 * travel directly from the browser to private Storage rather than through the
 * website server.
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

        let body: { kind?: unknown; fileName?: unknown; size?: unknown; contentType?: unknown };
        try {
          body = await request.json() as typeof body;
        } catch {
          return new Response("Invalid upload", { status: 400 });
        }

        const kind = typeof body.kind === "string" ? body.kind : "";
        const fileName = typeof body.fileName === "string" ? body.fileName.toLowerCase() : "";
        const size = typeof body.size === "number" ? body.size : 0;
        const contentType = typeof body.contentType === "string" ? body.contentType : "application/octet-stream";

        const isBook = kind === "book";
        const isApp = kind === "app";
        if (!isBook && !isApp) return new Response("Unknown upload kind", { status: 400 });

        const isPdf = fileName.endsWith(".pdf") || contentType === "application/pdf";
        const isAndroidPackage = fileName.endsWith(".apk") || fileName.endsWith(".aab");
        if (isBook && !isPdf) {
          return new Response("Only PDF files are allowed for books", { status: 400 });
        }
        if (isApp && !isAndroidPackage) return new Response("Choose an APK or AAB file", { status: 400 });
        if (!Number.isSafeInteger(size) || size <= 0 || size > (isBook ? BOOK_MAX : APP_MAX)) {
          return new Response(isBook ? "PDF must be smaller than 100 MB" : "App file must be smaller than 200 MB", {
            status: 413,
          });
        }

        const ext = isBook ? "pdf" : fileName.endsWith(".aab") ? "aab" : "apk";
        const bucket = isBook ? "books" : "app-files";
        const path = isBook ? `books/${crypto.randomUUID()}.${ext}` : `app/ngn-app-${crypto.randomUUID()}.${ext}`;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(bucket).createSignedUploadUrl(path);
        if (error || !data) {
          console.error("Could not create an admin upload token:", error?.message);
          return new Response("Could not prepare the upload. Please try again.", { status: 500 });
        }

        return Response.json({ bucket, path, token: data.token, size, contentType: isBook ? "application/pdf" : contentType });
      },
    },
  },
});
