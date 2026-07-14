import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { bibleBooks, sampleChapter } from "@/lib/mock-data";
import { Search, Bookmark, Highlighter, ChevronDown } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/bible")({
  head: () => ({
    meta: [
      { title: "Bible — New Generation Network" },
      { name: "description", content: "Read, search, bookmark, and reflect on Scripture." },
    ],
  }),
  component: BiblePage,
});

function BiblePage() {
  const [query, setQuery] = useState("");
  const [openPicker, setOpenPicker] = useState(false);

  return (
    <MobileShell title="Holy Bible">
      <div className="px-5 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search verses, e.g. 'love'"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Book/Chapter picker */}
        <button
          onClick={() => setOpenPicker((o) => !o)}
          className="w-full flex items-center justify-between p-4 rounded-xl bg-hero-gradient text-white shadow-elegant"
        >
          <div className="text-left">
            <p className="text-[10px] uppercase tracking-widest text-white/70">Now reading</p>
            <p className="font-display font-bold text-lg">{sampleChapter.book} {sampleChapter.chapter}</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-white/20">NKJV</span>
            <ChevronDown className={`size-5 transition ${openPicker ? "rotate-180" : ""}`} />
          </div>
        </button>

        {openPicker && (
          <div className="grid grid-cols-3 gap-2 p-3 bg-card border border-border rounded-xl max-h-64 overflow-y-auto no-scrollbar">
            {bibleBooks.map((b) => (
              <button
                key={b}
                className={`text-xs py-2 rounded-lg font-medium transition ${
                  b === sampleChapter.book
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        )}

        {/* Chapter */}
        <article className="space-y-3">
          <h2 className="font-serif text-3xl italic text-primary">Chapter {sampleChapter.chapter}</h2>
          <div className="space-y-2 text-[15px] leading-relaxed text-foreground">
            {sampleChapter.verses.map((v, i) => (
              <p key={i} className="group">
                <sup className="text-[10px] font-bold text-primary mr-1.5 align-super">{i + 1}</sup>
                <span className="group-hover:bg-primary/5 rounded transition">{v}</span>
              </p>
            ))}
          </div>
        </article>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-semibold hover:border-primary/40 transition">
            <Bookmark className="size-4" /> Bookmark
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-card border border-border text-sm font-semibold hover:border-primary/40 transition">
            <Highlighter className="size-4" /> Highlight
          </button>
        </div>

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 text-xs text-muted-foreground">
          Bible reading plans, multiple versions, notes, and highlights sync when you sign in.
        </div>
      </div>
    </MobileShell>
  );
}
