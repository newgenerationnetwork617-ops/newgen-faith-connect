import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Search, Play, Headphones, BookOpenCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useTeachings } from "@/lib/content";

export const Route = createFileRoute("/teachings")({
  head: () => ({
    meta: [
      { title: "Teachings & Sermons — New Generation Network" },
      { name: "description", content: "Video and audio teachings, Bible studies, and teaching series." },
      { property: "og:title", content: "Teachings & Sermons — New Generation Network" },
      { property: "og:description", content: "Video and audio teachings, Bible studies, and teaching series." },
    ],
  }),
  component: TeachingsPage,
});

const tabs = [
  { key: "video", label: "Video", icon: Play },
  { key: "audio", label: "Audio", icon: Headphones },
  { key: "study", label: "Studies", icon: BookOpenCheck },
] as const;

function TeachingsPage() {
  const [kind, setKind] = useState<(typeof tabs)[number]["key"]>("video");
  const [term, setTerm] = useState("");
  const { data = [], isLoading } = useTeachings(kind);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return data;
    return data.filter((t) =>
      [t.title, t.speaker, t.topic, t.series ?? ""].join(" ").toLowerCase().includes(q),
    );
  }, [data, term]);

  return (
    <MobileShell title="Teachings">
      <div className="px-5 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search by topic or speaker"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setKind(t.key)}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition ${
                kind === t.key
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <t.icon className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading teachings…</p>}
        {!isLoading && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No teachings published in this section yet.</p>
        )}

        <div className="space-y-3">
          {results.map((t) => (
            <article key={t.id} className="rounded-2xl bg-card border border-border overflow-hidden">
              {t.youtube_id ? (
                <div className="aspect-video bg-navy">
                  <iframe
                    className="size-full"
                    src={`https://www.youtube.com/embed/${t.youtube_id}`}
                    title={t.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : null}
              <div className="p-4">
                <p className="text-[10px] uppercase tracking-widest text-accent font-bold">{t.topic || t.kind}</p>
                <h3 className="font-display font-bold text-sm leading-snug mt-0.5">{t.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">
                  {[t.speaker, t.duration].filter(Boolean).join(" • ")}
                </p>
                {t.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{t.description}</p>}
                {t.media_url && (
                  <audio controls preload="none" src={t.media_url} className="w-full mt-3">
                    <track kind="captions" />
                  </audio>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
