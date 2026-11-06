import { youtubeEmbed } from "@/lib/youtube";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import { TeachingEngagement } from "@/components/teaching-engagement";
import { Search, Play, Headphones, BookOpenCheck, BookOpen, Download, Eye } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { bookUrl, formatDate, useBooks, useTeachings, type Book } from "@/lib/content";

const TABS = ["video", "audio", "study", "books"] as const;
type Tab = (typeof TABS)[number];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const Route = createFileRoute("/teachings")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab; teaching?: string } => ({
    tab: TABS.includes(s.tab as Tab) ? (s.tab as Tab) : undefined,
    teaching: typeof s.teaching === "string" && UUID.test(s.teaching) ? s.teaching : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Teachings & Devotion Books — New Generation Network" },
      { name: "description", content: "Video and audio teachings, Bible studies and downloadable devotion books." },
      { property: "og:title", content: "Teachings & Devotion Books — New Generation Network" },
      { property: "og:description", content: "Watch teachings and download devotion books from New Generation Network." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeachingsPage,
});

const tabs = [
  { key: "video", label: "Video", icon: Play },
  { key: "audio", label: "Audio", icon: Headphones },
  { key: "study", label: "Studies", icon: BookOpenCheck },
  { key: "books", label: "Books", icon: BookOpen },
] as const;

function TeachingsPage() {
  const search = Route.useSearch();
  const navigate = useNavigate({ from: "/teachings" });
  const tab: Tab = search.tab ?? "video";
  const [term, setTerm] = useState("");
  const teachings = useTeachings(tab === "books" ? undefined : tab);
  const books = useBooks();

  useEffect(() => {
    if (!search.teaching) return;
    const t = window.setTimeout(() => document.getElementById(`t-${search.teaching}`)?.scrollIntoView({ behavior: "smooth", block: "start" }), 300);
    return () => window.clearTimeout(t);
  }, [search.teaching, teachings.data]);

  const q = term.trim().toLowerCase();
  const results = useMemo(() => {
    const all = (teachings.data ?? []).filter((t) => !search.teaching || tab !== "video" || true);
    // A shared link may point at a teaching of any type, so show it on top regardless of tab.
    return q ? all.filter((t) => [t.title, t.speaker, t.topic, t.series ?? ""].join(" ").toLowerCase().includes(q)) : all;
  }, [teachings.data, q, search.teaching, tab]);
  const bookResults = useMemo(
    () => (books.data ?? []).filter((b) => !q || [b.title, b.author ?? "", b.description ?? ""].join(" ").toLowerCase().includes(q)),
    [books.data, q],
  );

  return (
    <SiteShell>
      <section className="bg-sky-wash px-5 pb-8 pt-10">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">Grow in the Word</p>
        <h1 className="mt-1 font-display text-4xl font-extrabold">Teachings</h1>
        <p className="mt-2 text-sm text-muted-foreground">Videos, audio messages, Bible studies and devotion books.</p>
        <div className="relative mt-6">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={term} onChange={(e) => setTerm(e.target.value)} placeholder="Search by title, topic or speaker" className="w-full rounded-full border border-border bg-card py-3 pl-11 pr-4 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => navigate({ search: { tab: t.key } })} className={`flex flex-col items-center gap-1.5 rounded-2xl border py-3 transition ${tab === t.key ? "border-transparent bg-primary text-primary-foreground shadow-elegant" : "border-border bg-card text-muted-foreground hover:border-primary/30"}`}>
              <t.icon className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="space-y-4 px-5 pb-14">
        {tab === "books" ? (
          <>
            {books.isLoading && <p className="text-sm text-muted-foreground">Loading books…</p>}
            {!books.isLoading && bookResults.length === 0 && <EmptyNote text="No devotion books published yet." />}
            {bookResults.map((b) => <BookCard key={b.id} book={b} />)}
          </>
        ) : (
          <>
            {teachings.isLoading && <p className="text-sm text-muted-foreground">Loading teachings…</p>}
            {!teachings.isLoading && results.length === 0 && <EmptyNote text="No teachings published in this section yet." />}
            {results.map((t) => (
              <article id={`t-${t.id}`} key={t.id} className={`scroll-mt-24 overflow-hidden rounded-3xl border bg-card shadow-soft ${search.teaching === t.id ? "border-primary ring-2 ring-primary/30" : "border-border"}`}>
                {youtubeEmbed(t.youtube_id) && (
                  <div className="aspect-video bg-navy">
                    <iframe className="size-full" src={youtubeEmbed(t.youtube_id)!} title={t.title} loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowFullScreen />
                  </div>
                )}
                <div className="space-y-3 p-5">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t.topic || t.kind}</p>
                    <h3 className="mt-0.5 font-display text-base font-bold leading-snug">{t.title}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">{[t.speaker, t.duration].filter(Boolean).join(" • ")}</p>
                  </div>
                  {t.description && <p className="line-clamp-4 text-sm leading-relaxed text-muted-foreground">{t.description}</p>}
                  {t.media_url && (
                    <audio controls preload="none" src={t.media_url} className="w-full"><track kind="captions" /></audio>
                  )}
                  <TeachingEngagement teachingId={t.id} title={t.title} />
                </div>
              </article>
            ))}
          </>
        )}
      </div>
    </SiteShell>
  );
}

function BookCard({ book }: { book: Book }) {
  const [busy, setBusy] = useState<"" | "read" | "save">("");
  const [error, setError] = useState("");
  const safeName = `${book.title.replace(/[^\w\s-]/g, "").trim() || "devotion-book"}.pdf`;

  const open = async (mode: "read" | "save") => {
    setError("");
    // Open the tab synchronously so pop-up blockers allow it.
    const win = mode === "read" ? window.open("", "_blank") : null;
    setBusy(mode);
    try {
      const url = await bookUrl(book.file_path, mode === "save" ? safeName : undefined);
      if (win) win.location.href = url;
      else window.location.href = url;
    } catch {
      win?.close();
      setError("Couldn't open this book. Please try again.");
    } finally {
      setBusy("");
    }
  };

  return (
    <article className="flex gap-4 rounded-3xl border border-border bg-card p-4 shadow-soft">
      <div className="grid h-28 w-20 shrink-0 place-items-center overflow-hidden rounded-xl bg-hero-gradient text-primary-foreground">
        {book.cover_url ? <img src={book.cover_url} alt={book.title} className="size-full object-cover" /> : <BookOpen className="size-7" />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-base font-bold leading-snug">{book.title}</h3>
        <p className="text-xs text-muted-foreground">
          {[book.author || "New Generation Network", book.pages ? `${book.pages} pages` : null, formatDate(book.publish_at)].filter(Boolean).join(" • ")}
        </p>
        {book.description && <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{book.description}</p>}
        <div className="mt-auto flex flex-wrap gap-2 pt-3">
          <button onClick={() => open("read")} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-xs font-bold text-primary-foreground disabled:opacity-60">
            <Eye className="size-3.5" /> {busy === "read" ? "Opening…" : "Read"}
          </button>
          <button onClick={() => open("save")} disabled={!!busy} className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold disabled:opacity-60">
            <Download className="size-3.5" /> {busy === "save" ? "Starting…" : "Download"}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </article>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">{text}</p>;
}
