import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import {
  dailyVerse,
  dailyDevotional,
  featuredMovie,
  latestTeachings,
  upcomingEvents,
} from "@/lib/mock-data";
import { BookOpen, HandHeart, Mic, Radio, Play, ArrowRight, Calendar } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Generation Network — Home" },
      { name: "description", content: "Your daily home for gospel films, teachings, Bible, devotionals, and prayer." },
    ],
  }),
  component: HomePage,
});

const quickTiles = [
  { to: "/bible", label: "Bible", icon: BookOpen, tone: "bg-card" },
  { to: "/prayer", label: "Prayer Wall", icon: HandHeart, tone: "bg-card" },
  { to: "/teachings", label: "Teachings", icon: Mic, tone: "bg-card" },
  { to: "/live", label: "Live Now", icon: Radio, tone: "bg-hero-gradient text-white border-transparent" },
] as const;

function HomePage() {
  return (
    <MobileShell>
      <div className="px-5 py-6 space-y-8">
        {/* Greeting */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Peace be with you</p>
          <h1 className="font-display text-3xl font-bold tracking-tight mt-1">Good morning, Beloved</h1>
        </section>

        {/* Hero Verse */}
        <section className="bg-hero-gradient rounded-3xl p-7 text-white shadow-elegant relative overflow-hidden">
          <div className="absolute -right-16 -top-16 size-64 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4">Daily Bread</p>
            <p className="font-serif italic text-lg leading-snug text-balance">
              "{dailyVerse.text}"
            </p>
            <div className="mt-6 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{dailyVerse.reference}</p>
                <p className="text-[10px] uppercase tracking-widest text-white/60">{dailyVerse.version}</p>
              </div>
              <Link
                to="/bible"
                className="size-10 rounded-full bg-white text-primary grid place-items-center shadow-lg hover:scale-105 transition"
                aria-label="Open Bible"
              >
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Quick Tiles */}
        <section className="grid grid-cols-2 gap-3">
          {quickTiles.map(({ to, label, icon: Icon, tone }) => (
            <Link
              key={to}
              to={to}
              className={`aspect-[5/4] rounded-2xl border border-border p-4 flex flex-col justify-between transition hover:-translate-y-0.5 hover:shadow-soft ${tone}`}
            >
              <div
                className={`size-10 rounded-xl grid place-items-center ${
                  tone.includes("text-white") ? "bg-white/15" : "bg-primary/10 text-primary"
                }`}
              >
                <Icon className="size-5" />
              </div>
              <span className="font-display font-bold text-sm tracking-tight">{label}</span>
            </Link>
          ))}
        </section>

        {/* Featured Movie */}
        <section>
          <SectionHeader title="Featured Cinema" href="/watch" />
          <Link
            to="/watch"
            className="block rounded-2xl overflow-hidden bg-navy text-navy-foreground relative shadow-soft group"
          >
            <div className="aspect-video bg-night-gradient relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.15),transparent_60%)]" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="size-14 rounded-full bg-white/95 text-primary grid place-items-center shadow-xl group-hover:scale-110 transition">
                  <Play className="size-6 ml-0.5" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
                <div className="h-full bg-primary-glow" style={{ width: `${featuredMovie.progress * 100}%` }} />
              </div>
            </div>
            <div className="p-5 flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-accent font-bold">{featuredMovie.series}</p>
                <h3 className="font-display font-bold text-base mt-1">{featuredMovie.title}</h3>
                <p className="text-xs text-white/50 mt-0.5">{featuredMovie.duration} • Continue watching</p>
              </div>
              <ArrowRight className="size-5 text-white/60 group-hover:text-white transition" />
            </div>
          </Link>
        </section>

        {/* Daily Devotional */}
        <section>
          <SectionHeader title="Today's Devotional" href="/devotional" />
          <Link
            to="/devotional"
            className="block rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:-translate-y-0.5 transition"
          >
            <div className="aspect-[16/7] bg-hero-gradient relative">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.2),transparent)]" />
              <div className="absolute bottom-3 left-4">
                <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest">
                  {dailyDevotional.theme}
                </span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="font-display font-bold text-xl leading-tight text-balance">
                {dailyDevotional.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{dailyDevotional.message}</p>
              <p className="mt-3 text-xs font-semibold text-primary tracking-wide">
                {dailyDevotional.verse} • Read devotional →
              </p>
            </div>
          </Link>
        </section>

        {/* Latest Teachings */}
        <section>
          <SectionHeader title="Latest Teachings" href="/teachings" />
          <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
            {latestTeachings.map((t) => (
              <Link
                key={t.id}
                to="/teachings"
                className="flex-none w-[180px] group"
              >
                <div className="aspect-[4/5] rounded-xl bg-night-gradient relative overflow-hidden mb-2 shadow-soft">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,rgba(255,255,255,0.18),transparent_65%)]" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{t.topic}</span>
                  </div>
                  <div className="absolute top-3 right-3 size-8 rounded-full bg-white/90 text-primary grid place-items-center">
                    <Play className="size-3.5 ml-0.5" fill="currentColor" />
                  </div>
                </div>
                <h4 className="font-display font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition">
                  {t.title}
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">{t.speaker} • {t.duration}</p>
              </Link>
            ))}
          </div>
        </section>

        {/* Upcoming Events */}
        <section>
          <SectionHeader title="Upcoming Events" href="/events" />
          <div className="space-y-2.5">
            {upcomingEvents.slice(0, 2).map((e) => (
              <Link
                key={e.id}
                to="/events"
                className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition"
              >
                <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center shrink-0">
                  <Calendar className="size-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-bold text-sm">{e.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{e.date} • {e.location}</p>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{e.type}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Announcement banner */}
        <section className="bg-navy text-navy-foreground rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-primary/40 blur-3xl rounded-full" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Ministry Announcement</p>
            <h3 className="font-display text-xl font-bold leading-tight">
              We are a people raised to raise a righteous generation for Christ.
            </h3>
            <Link
              to="/about"
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white"
            >
              Read our vision <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="flex items-baseline justify-between mb-3">
      <h2 className="font-display text-lg font-bold tracking-tight">{title}</h2>
      <Link to={href} className="text-[11px] font-bold uppercase tracking-widest text-primary">
        View all
      </Link>
    </div>
  );
}
