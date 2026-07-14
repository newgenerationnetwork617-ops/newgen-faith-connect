import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { featuredMovie, latestTeachings } from "@/lib/mock-data";
import { Play, Search, Heart, Clock } from "lucide-react";

export const Route = createFileRoute("/watch")({
  head: () => ({
    meta: [
      { title: "Gospel Movies — New Generation Network" },
      { name: "description", content: "Watch gospel movies and inspiring Christian films." },
    ],
  }),
  component: WatchPage,
});

const categories = ["All", "Movies", "Series", "Short Films", "Documentaries"];

function WatchPage() {
  return (
    <MobileShell title="Watch">
      <div className="px-5 py-6 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search gospel films & series"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
          {categories.map((c, i) => (
            <button
              key={c}
              className={`flex-none px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition ${
                i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Featured */}
        <section>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Continue Watching</p>
          <div className="rounded-2xl overflow-hidden bg-navy text-navy-foreground shadow-elegant relative">
            <div className="aspect-video bg-night-gradient relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.18),transparent_65%)]" />
              <div className="absolute inset-0 grid place-items-center">
                <button className="size-16 rounded-full bg-white text-primary grid place-items-center shadow-2xl">
                  <Play className="size-7 ml-1" fill="currentColor" />
                </button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-primary-glow" style={{ width: `${featuredMovie.progress * 100}%` }} />
              </div>
            </div>
            <div className="p-5">
              <p className="text-[10px] uppercase tracking-widest text-accent font-bold">{featuredMovie.series}</p>
              <h3 className="font-display text-xl font-bold mt-1">{featuredMovie.title}</h3>
              <p className="text-xs text-white/60 mt-1">{featuredMovie.duration} remaining</p>
              <div className="flex gap-2 mt-4">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  <Play className="size-3.5" fill="currentColor" /> Resume
                </button>
                <button className="size-9 grid place-items-center rounded-full bg-white/10"><Heart className="size-4" /></button>
                <button className="size-9 grid place-items-center rounded-full bg-white/10"><Clock className="size-4" /></button>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section>
          <h2 className="font-display font-bold text-lg mb-3">Latest Releases</h2>
          <div className="grid grid-cols-2 gap-3">
            {latestTeachings.map((t) => (
              <div key={t.id} className="group">
                <div className="aspect-[3/4] rounded-xl bg-night-gradient relative overflow-hidden shadow-soft">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.15),transparent_65%)]" />
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="size-10 rounded-full bg-white/90 text-primary grid place-items-center">
                      <Play className="size-4 ml-0.5" fill="currentColor" />
                    </div>
                  </div>
                  <div className="absolute bottom-2 right-2 text-[10px] font-bold text-white bg-black/40 px-1.5 py-0.5 rounded">
                    {t.duration}
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm mt-2 line-clamp-2 leading-snug group-hover:text-primary transition">
                  {t.title}
                </h4>
                <p className="text-[11px] text-muted-foreground">{t.speaker}</p>
              </div>
            ))}
          </div>
        </section>

        <p className="text-xs text-muted-foreground text-center pt-4">
          Movies stream from the official NGN YouTube channel once connected.
        </p>
      </div>
    </MobileShell>
  );
}
