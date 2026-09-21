import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { BIBLE_BOOKS, getBook, bookIndex } from "@/lib/bible-books";
import { TRANSLATIONS, chapterQueryOptions, readCachedChapter, type Verse } from "@/lib/bible";
import {
  Search, ChevronDown, ChevronLeft, ChevronRight, Loader2, X, Minus, Plus, Copy, Share2, Check, WifiOff,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { keepPreviousData, useQuery, useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/bible")({
  head: () => ({
    meta: [
      { title: "Holy Bible — New Generation Network" },
      { name: "description", content: "Read the Holy Bible — all 66 books in KJV, WEB, ASV and more, with offline reading." },
      { property: "og:title", content: "Holy Bible — New Generation Network" },
      { property: "og:description", content: "All 66 books, multiple versions, adjustable text size and offline reading." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: BiblePage,
});

const POSITION_KEY = "ngn-bible-position";
const PREFS_KEY = "ngn-bible-prefs";
const SIZES = [15, 17, 19, 22, 25];

function BiblePage() {
  const queryClient = useQueryClient();
  const [book, setBook] = useState("John");
  const [chapter, setChapter] = useState(1);
  const [translation, setTranslation] = useState("kjv");
  const [sizeIdx, setSizeIdx] = useState(1);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerBook, setPickerBook] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [activeVerse, setActiveVerse] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);
  const [ready, setReady] = useState(false);

  const meta = getBook(book);

  // Restore saved position + preferences once, on the client.
  useEffect(() => {
    try {
      const pos = JSON.parse(window.localStorage.getItem(POSITION_KEY) ?? "null") as
        | { book?: string; chapter?: number }
        | null;
      if (pos?.book && getBook(pos.book)) {
        setBook(pos.book);
        setChapter(pos.chapter && pos.chapter > 0 ? pos.chapter : 1);
      }
      const prefs = JSON.parse(window.localStorage.getItem(PREFS_KEY) ?? "null") as
        | { translation?: string; sizeIdx?: number }
        | null;
      if (prefs?.translation && TRANSLATIONS.some((t) => t.id === prefs.translation)) setTranslation(prefs.translation);
      if (typeof prefs?.sizeIdx === "number" && prefs.sizeIdx >= 0 && prefs.sizeIdx < SIZES.length) setSizeIdx(prefs.sizeIdx);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  const { data, isPending, isFetching, isError, refetch } = useQuery({
    ...chapterQueryOptions(translation, book, chapter),
    enabled: ready,
    placeholderData: keepPreviousData,
  });
  const verses: Verse[] = data ?? [];

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(POSITION_KEY, JSON.stringify({ book, chapter }));
      window.localStorage.setItem(PREFS_KEY, JSON.stringify({ translation, sizeIdx }));
    } catch {
      /* ignore */
    }
    setActiveVerse(null);
    if (meta && chapter < meta.chapters) {
      void queryClient.prefetchQuery(chapterQueryOptions(translation, book, chapter + 1));
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [book, chapter, translation, sizeIdx, meta, queryClient, ready]);

  const goPrev = useCallback(() => {
    if (chapter > 1) return setChapter(chapter - 1);
    const idx = bookIndex(book);
    if (idx > 0) {
      setBook(BIBLE_BOOKS[idx - 1].name);
      setChapter(BIBLE_BOOKS[idx - 1].chapters);
    }
  }, [book, chapter]);

  const goNext = useCallback(() => {
    if (meta && chapter < meta.chapters) return setChapter(chapter + 1);
    const idx = bookIndex(book);
    if (idx >= 0 && idx < BIBLE_BOOKS.length - 1) {
      setBook(BIBLE_BOOKS[idx + 1].name);
      setChapter(1);
    }
  }, [book, chapter, meta]);

  const filteredBooks = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return BIBLE_BOOKS;
    return BIBLE_BOOKS.filter((b) => b.name.toLowerCase().includes(q) || b.abbr.toLowerCase().startsWith(q));
  }, [query]);

  const shareVerse = async (v: Verse) => {
    const text = `"${v.text}" — ${book} ${chapter}:${v.verse} (${translation.toUpperCase()})`;
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title: `${book} ${chapter}:${v.verse}`, text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* dismissed */
    }
  };

  const copyVerse = async (v: Verse) => {
    try {
      await navigator.clipboard.writeText(`"${v.text}" — ${book} ${chapter}:${v.verse}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const showSkeleton = isPending || !ready;
  const offlineCopy = !showSkeleton && isError && readCachedChapter(translation, book, chapter) === null;
  const progress = meta ? Math.round((chapter / meta.chapters) * 100) : 0;

  return (
    <MobileShell title="Holy Bible">
      {/* Sticky reader controls */}
      <div className="sticky top-[65px] z-30 bg-background/90 backdrop-blur-xl border-b border-border/60">
        <div className="px-5 pt-3 pb-2 flex items-center gap-2">
          <button
            onClick={() => {
              setPickerBook(null);
              setQuery("");
              setPickerOpen(true);
            }}
            className="flex-1 flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl bg-hero-gradient text-white shadow-elegant"
          >
            <span className="font-display font-bold text-sm">
              {book} {chapter}
            </span>
            <ChevronDown className="size-4 opacity-80" />
          </button>

          <div className="flex items-center rounded-xl border border-border bg-card overflow-hidden">
            <button
              onClick={() => setSizeIdx((i) => Math.max(0, i - 1))}
              disabled={sizeIdx === 0}
              aria-label="Smaller text"
              className="size-10 grid place-items-center disabled:opacity-40"
            >
              <Minus className="size-4" />
            </button>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground px-1">Aa</span>
            <button
              onClick={() => setSizeIdx((i) => Math.min(SIZES.length - 1, i + 1))}
              disabled={sizeIdx === SIZES.length - 1}
              aria-label="Larger text"
              className="size-10 grid place-items-center disabled:opacity-40"
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 pb-2.5">
          {TRANSLATIONS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTranslation(t.id)}
              title={t.name}
              className={`flex-none px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide transition ${
                t.id === translation
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-primary"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="h-0.5 bg-muted">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="px-5 py-6 space-y-5">
        <header className="space-y-1">
          <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold">
            {meta?.testament === "OT" ? "Old Testament" : "New Testament"} • Chapter {chapter} of {meta?.chapters ?? 1}
          </p>
          <h2 className="font-serif text-4xl italic leading-none">
            {book} {chapter}
          </h2>
        </header>

        <article className="min-h-[40vh]">
          {showSkeleton && (
            <div className="space-y-3 animate-pulse pt-2">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3.5 rounded bg-muted w-full" />
                  <div className="h-3.5 rounded bg-muted w-[85%]" />
                </div>
              ))}
              <div className="flex items-center gap-2 text-xs text-muted-foreground justify-center pt-4">
                <Loader2 className="size-3.5 animate-spin" /> Opening the Word…
              </div>
            </div>
          )}

          {offlineCopy && (
            <div className="p-5 rounded-2xl bg-card border border-border text-sm space-y-3 text-center">
              <WifiOff className="size-6 mx-auto text-muted-foreground" />
              <p className="text-muted-foreground">
                This chapter could not be loaded. Check your connection, or try another version.
              </p>
              <button
                onClick={() => void refetch()}
                className="px-5 py-2.5 rounded-xl bg-hero-gradient text-white text-xs font-bold uppercase tracking-widest"
              >
                {isFetching ? "Retrying…" : "Try again"}
              </button>
            </div>
          )}

          {!showSkeleton && !offlineCopy && (
            <div
              className="space-y-3 text-foreground/90"
              style={{ fontSize: SIZES[sizeIdx], lineHeight: 1.75 }}
            >
              {verses.map((v) => (
                <div key={v.verse}>
                  <p
                    onClick={() => setActiveVerse(activeVerse === v.verse ? null : v.verse)}
                    className={`cursor-pointer rounded-lg px-1 -mx-1 transition ${
                      activeVerse === v.verse ? "bg-primary/10" : "hover:bg-muted/60"
                    }`}
                  >
                    <sup className="text-[11px] font-bold text-primary mr-1.5 align-super">{v.verse}</sup>
                    {v.text}
                  </p>
                  {activeVerse === v.verse && (
                    <div className="flex gap-2 mt-2 mb-1">
                      <button
                        onClick={() => void copyVerse(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted text-xs font-semibold"
                      >
                        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />} Copy
                      </button>
                      <button
                        onClick={() => void shareVerse(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold"
                      >
                        <Share2 className="size-3.5" /> Share
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {isFetching && (
                <p className="text-center text-xs text-muted-foreground pt-3">Updating…</p>
              )}
            </div>
          )}
        </article>

        <div className="flex items-center gap-2 pt-2">
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

      {pickerOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setPickerOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[440px] h-[85vh] bg-background rounded-t-3xl border border-border shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <p className="font-display font-bold text-sm">
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
                      autoFocus
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Search all 66 books"
                      className="w-full pl-11 pr-4 py-2.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4">
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
                              onClick={() => {
                                if (b.chapters === 1) {
                                  setBook(b.name);
                                  setChapter(1);
                                  setPickerOpen(false);
                                  setPickerBook(null);
                                  setQuery("");
                                  return;
                                }
                                setPickerBook(b.name);
                              }}
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
              <div className="flex-1 overflow-y-auto overscroll-contain p-4">
                <button
                  onClick={() => setPickerBook(null)}
                  className="text-xs font-semibold text-primary mb-3 flex items-center gap-1"
                >
                  <ChevronLeft className="size-3.5" /> All books
                </button>
                <div className="grid grid-cols-5 gap-2">
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
