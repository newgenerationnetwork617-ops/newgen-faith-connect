import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { BIBLE_BOOKS, getBook } from "@/lib/bible-books";
import { Search, ChevronDown, ChevronLeft, ChevronRight, Loader2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

export const Route = createFileRoute("/bible")({
  head: () => ({
    meta: [
      { title: "Bible — New Generation Network" },
      { name: "description", content: "Read the Holy Bible — all 66 books, all chapters, with navigation and search." },
    ],
  }),
  component: BiblePage,
});

type Verse = { verse: number; text: string };

async function fetchChapter(book: string, chapter: number): Promise<Verse[]> {
  // bible-api.com — free, no key, KJV by default
  const ref = encodeURIComponent(`${book} ${chapter}`);
  const res = await fetch(`https://bible-api.com/${ref}`);
  if (!res.ok) throw new Error("Failed to load chapter");
  const data = (await res.json()) as { verses: { verse: number; text: string }[] };
  return data.verses.map((v) => ({ verse: v.verse, text: v.text.trim() }));
}

function BiblePage() {
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [verses, setVerses] = useState<Verse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBook, setPickerBook] = useState<string | null>(null);
  const [query, setQuery] = useState("");

  const meta = getBook(book);
  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(q));
  }, [query]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchChapter(book, chapter)
      .then((v) => {
        if (!cancelled) setVerses(v);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Could not load chapter.");
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [book, chapter]);

  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, [book, chapter]);

  const goPrev = () => {
    if (chapter > 1) return setChapter(chapter - 1);
    const idx = BIBLE_BOOKS.findIndex((b) => b.name === book);
    if (idx > 0) {
      const prev = BIBLE_BOOKS[idx - 1];
      setBook(prev.name);
      setChapter(prev.chapters);
    }
  };
  const goNext = () => {
    if (meta && chapter < meta.chapters) return setChapter(chapter + 1);
    const idx = BIBLE_BOOKS.findIndex((b) => b.name === book);
    if (idx >= 0 && idx < BIBLE_BOOKS.length - 1) {
      setBook(BIBLE_BOOKS[idx + 1].name);
      setChapter(1);
    }
  };

  return (
    <MobileShell title="Holy Bible">
      <div className="px-5 py-6 space-y-5">
        {/* Book/Chapter picker trigger */}
        <button
          onClick={() => {
            setPickerBook(book);
            setPickerOpen(true);
          }}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-hero-gradient text-white shadow-elegant"
        >
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest text-white/70">Now reading</p>
            <p className="font-display font-bold text-lg">
              {book} {chapter}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">KJV</span>
            <ChevronDown className="size-5" />
          </div>
        </button>

        {/* Chapter navigation */}
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={goPrev}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold hover:border-primary/40 transition"
          >
            <ChevronLeft className="size-4" /> Prev
          </button>
          <p className="text-xs text-muted-foreground">
            Chapter {chapter}
            {meta ? ` of ${meta.chapters}` : ""}
          </p>
          <button
            onClick={goNext}
            className="flex items-center gap-1 px-3 py-2 rounded-lg bg-card border border-border text-xs font-semibold hover:border-primary/40 transition"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>

        {/* Chapter body */}
        <article className="space-y-3 min-h-[40vh]">
          <h2 className="font-serif text-3xl italic text-primary">
            {book} {chapter}
          </h2>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
              <Loader2 className="size-4 animate-spin" /> Loading chapter…
            </div>
          )}

          {error && !loading && (
            <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-sm text-destructive">
              {error}. Please check your connection and try again.
            </div>
          )}

          {!loading && !error && (
            <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
              {verses.map((v) => (
                <p key={v.verse} className="group">
                  <sup className="text-[10px] font-bold text-primary mr-1.5 align-super">{v.verse}</sup>
                  <span className="group-hover:bg-primary/5 rounded transition">{v.text}</span>
                </p>
              ))}
            </div>
          )}
        </article>

        {/* Bottom nav */}
        <div className="flex items-center justify-between gap-2 pt-2">
          <button
            onClick={goPrev}
            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-card border border-border text-sm font-semibold"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <button
            onClick={goNext}
            className="flex-1 flex items-center justify-center gap-1 py-3 rounded-xl bg-hero-gradient text-white text-sm font-semibold shadow-elegant"
          >
            Next <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Book/Chapter picker sheet */}
      {pickerOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-[440px] max-h-[85vh] bg-background rounded-t-2xl sm:rounded-2xl border border-border shadow-2xl flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-display font-bold">
                {pickerBook ? `${pickerBook} — choose chapter` : "Choose a book"}
              </p>
              <button
                onClick={() => setPickerOpen(false)}
                className="size-8 rounded-full grid place-items-center hover:bg-muted"
                aria-label="Close"
              >
                <X className="size-4" />
              </button>
            </div>

            {!pickerBook ? (
              <>
                <div className="p-4 border-b border-border">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search books"
                      className="w-full pl-11 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto p-4 space-y-4">
                  {(["OT", "NT"] as const).map((t) => {
                    const list = filteredBooks.filter((b) => b.testament === t);
                    if (list.length === 0) return null;
                    return (
                      <div key={t}>
                        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-2">
                          {t === "OT" ? "Old Testament" : "New Testament"}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {list.map((b) => (
                            <button
                              key={b.name}
                              onClick={() => setPickerBook(b.name)}
                              className={`text-left text-sm py-2.5 px-3 rounded-lg font-medium transition ${
                                b.name === book
                                  ? "bg-primary text-primary-foreground"
                                  : "bg-muted hover:bg-primary/10 hover:text-primary"
                              }`}
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="overflow-y-auto p-4">
                <button
                  onClick={() => setPickerBook(null)}
                  className="text-xs font-semibold text-primary mb-3 flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" /> All books
                </button>
                <div className="grid grid-cols-6 gap-2">
                  {Array.from({ length: getBook(pickerBook)?.chapters ?? 0 }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      onClick={() => {
                        setBook(pickerBook);
                        setChapter(n);
                        setPickerOpen(false);
                        setPickerBook(null);
                        setQuery("");
                      }}
                      className={`aspect-square rounded-lg text-sm font-semibold transition ${
                        pickerBook === book && n === chapter
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-primary/10 hover:text-primary"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}
