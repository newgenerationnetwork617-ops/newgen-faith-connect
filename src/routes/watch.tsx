import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Play, Search, Youtube } from "lucide-react";
import { useMemo, useState } from "react";
import { useTeachings, useContactInfo } from "@/lib/content";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Gospel Movies & Films — New Generation Network" },
      { name: "description", content: "Watch gospel movies, short films and inspiring Christian videos." },
      { property: "og:title", content: "Gospel Movies & Films — New Generation Network" },
      { property: "og:description", content: "Watch gospel movies, short films and inspiring Christian videos." },
    ],
  }),
  component: WatchPage,
});

function WatchPage() {
  const { data = [], isLoading } = useTeachings("video");
  const { contact } = useContactInfo();
  const [term, setTerm] = useState("");
  const [active, setActive] = useState<string | null>(null);

  const results = useMemo(() => {
    const q = term.trim().toLowerCase();
    if (!q) return data;
    return data.filter((t) => `${t.title} ${t.series ?? ""} ${t.topic}`.toLowerCase().includes(q));
  }, [data, term]);

  const featured = results[0];

  return (
    <MobileShell title="Watch">
      <div className="px-5 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search gospel films & series"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading films…</p>}

        {featured && (
          <section>
            <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Featured</p>
            <div className="rounded-2xl overflow-hidden bg-navy text-navy-foreground shadow-elegant">
              {featured.youtube_id ? (
                <div className="aspect-video">
                  <iframe
                    className="size-full"
                    src={`https://www.youtube.com/embed/${featured.youtube_id}`}
                    title={featured.title}
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div className="aspect-video bg-night-gradient grid place-items-center">
                  <Play className="size-10 text-white/70" />
                </div>
              )}
              <div className="p-5">
                <p className="text-[10px] uppercase tracking-widest text-accent font-bold">
                  {featured.series ?? featured.topic}
                </p>
                <h3 className="font-display text-xl font-bold mt-1">{featured.title}</h3>
                {featured.duration && <p className="text-xs text-white/60 mt-1">{featured.duration}</p>}
              </div>
            </div>
          </section>
        )}

        {!isLoading && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">
            No films published yet. Visit our YouTube channel for the latest releases.
          </p>
        )}

        {results.length > 1 && (
          <section>
            <h2 className="font-display font-bold text-lg mb-3">More to watch</h2>
            <div className="space-y-3">
              {results.slice(1).map((t) => (
                <article key={t.id} className="rounded-2xl bg-card border border-border overflow-hidden">
                  {active === t.id && t.youtube_id ? (
                    <div className="aspect-video">
                      <iframe
                        className="size-full"
                        src={`https://www.youtube.com/embed/${t.youtube_id}?autoplay=1`}
                        title={t.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  ) : (
                    <button
                      onClick={() => setActive(t.id)}
                      className="w-full aspect-video bg-night-gradient grid place-items-center relative"
                    >
                      {t.thumbnail_url && (
                        <img src={t.thumbnail_url} alt={t.title} className="absolute inset-0 size-full object-cover" />
                      )}
                      <span className="relative size-12 rounded-full bg-white/90 text-primary grid place-items-center">
                        <Play className="size-5 ml-0.5" fill="currentColor" />
                      </span>
                    </button>
                  )}
                  <div className="p-4">
                    <h3 className="font-display font-bold text-sm">{t.title}</h3>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {[t.speaker, t.duration].filter(Boolean).join(" • ")}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        <a
          href={contact.youtube}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hero-gradient text-white text-sm font-bold shadow-elegant"
        >
          <Youtube className="size-4" /> Visit NGN Official TV
        </a>

        <Link to="/teachings" className="block text-center text-xs font-bold uppercase tracking-widest text-primary">
          Browse teachings & studies
        </Link>
      </div>
    </MobileShell>
  );
}
