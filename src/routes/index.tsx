import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { dailyVerse } from "@/lib/mock-data";
import {
  BookOpen, HandHeart, Mic, Radio, Play, ArrowRight, Calendar, Users, Search, Sparkles,
} from "lucide-react";
import {
  useLatestDevotional, useTeachings, useEvents, useAnnouncements, formatDateTime,
} from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Generation Network — Raising a Righteous Generation" },
      {
        name: "description",
        content: "Your daily home for gospel films, teachings, the Bible, devotionals, prayer and live services.",
      },
      { property: "og:title", content: "New Generation Network — Raising a Righteous Generation" },
      {
        property: "og:description",
        content: "Gospel films, teachings, the Bible, daily devotionals, prayer and live services in one app.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

const quickTiles = [
  { to: "/bible", label: "Bible", icon: BookOpen, tone: "bg-card" },
  { to: "/prayer", label: "Prayer Wall", icon: HandHeart, tone: "bg-card" },
  { to: "/teachings", label: "Teachings", icon: Mic, tone: "bg-card" },
  { to: "/community", label: "Community", icon: Users, tone: "bg-card" },
  { to: "/search", label: "Search", icon: Search, tone: "bg-card" },
  { to: "/live", label: "Live Now", icon: Radio, tone: "bg-hero-gradient text-white border-transparent" },
] as const;

function HomePage() {
  const { devotional } = useLatestDevotional();
  const { data: teachings = [] } = useTeachings();
  const { data: events = [] } = useEvents();
  const { data: announcements = [] } = useAnnouncements();
  const announcement = announcements[0];
  const featured = teachings[0];

  return (
    <MobileShell>
      <div className="px-5 py-6 space-y-8">
        <section>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary/70">Peace be with you</p>
          <h1 className="font-display text-3xl font-bold tracking-tight mt-1">Welcome, Beloved</h1>
          <p className="text-sm text-muted-foreground mt-1">Raising a righteous generation for Christ.</p>
        </section>

        <section className="bg-hero-gradient rounded-2xl p-7 text-primary-foreground shadow-elegant relative overflow-hidden border border-primary/20">
          <div className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
          <div className="relative">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/70 mb-4">Daily Bread</p>
            <p className="font-serif italic text-lg leading-snug text-balance">"{dailyVerse.text}"</p>
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

        {featured && (
          <section>
            <SectionHeader title="Featured Cinema" href="/watch" />
            <Link to="/watch" className="block rounded-2xl overflow-hidden bg-navy text-navy-foreground shadow-soft group">
              <div className="aspect-video bg-night-gradient relative">
                {featured.thumbnail_url && (
                  <img src={featured.thumbnail_url} alt={featured.title} className="absolute inset-0 size-full object-cover" />
                )}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="size-14 rounded-full bg-white/95 text-primary grid place-items-center shadow-xl group-hover:scale-110 transition">
                    <Play className="size-6 ml-0.5" fill="currentColor" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-accent font-bold">
                    {featured.series ?? featured.topic}
                  </p>
                  <h3 className="font-display font-bold text-base mt-1">{featured.title}</h3>
                  {featured.duration && <p className="text-xs text-white/50 mt-0.5">{featured.duration}</p>}
                </div>
                <ArrowRight className="size-5 text-white/60 group-hover:text-white transition" />
              </div>
            </Link>
          </section>
        )}

        <section>
          <SectionHeader title="Today's Devotional" href="/devotional" />
          {devotional ? (
            <Link
              to="/devotional"
              className="block rounded-2xl bg-card border border-border overflow-hidden shadow-soft hover:-translate-y-0.5 transition group"
            >
              <div className="aspect-[16/8] bg-night-gradient relative overflow-hidden">
                {devotional.cover_url && (
                  <img src={devotional.cover_url} alt={devotional.title} loading="lazy" className="absolute inset-0 size-full object-cover" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/25 to-transparent" />
                <div className="absolute inset-x-5 bottom-4 flex items-end justify-between gap-3">
                  <span className="px-2.5 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-bold uppercase tracking-widest">
                    {devotional.theme || "Daily Word"}
                  </span>
                  <div className="size-9 rounded-full bg-card text-primary grid place-items-center group-hover:translate-x-0.5 transition">
                    <ArrowRight className="size-4" />
                  </div>
                </div>
              </div>
              <div className="p-5 border-l-4 border-accent">
                <h3 className="font-display font-bold text-xl leading-tight text-balance">{devotional.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{devotional.message}</p>
                <p className="mt-3 text-xs font-semibold text-primary tracking-wide">
                  {devotional.verse} • Read devotional →
                </p>
              </div>
            </Link>
          ) : (
            <Link
              to="/devotional"
              className="flex min-h-44 items-center gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft"
            >
              <div className="size-12 shrink-0 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <Sparkles className="size-5" />
              </div>
              <div>
                <h3 className="font-display font-bold">A fresh word for every day</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Scripture, reflection, life application and prayer will appear here when published.
                </p>
              </div>
            </Link>
          )}
        </section>

        {teachings.length > 0 && (
          <section>
            <SectionHeader title="Latest Teachings" href="/teachings" />
            <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-5 px-5">
              {teachings.slice(0, 8).map((t) => (
                <Link key={t.id} to="/teachings" className="flex-none w-[180px] group">
                  <div className="aspect-[4/5] rounded-xl bg-night-gradient relative overflow-hidden mb-2 shadow-soft">
                    {t.thumbnail_url && (
                      <img src={t.thumbnail_url} alt={t.title} className="absolute inset-0 size-full object-cover" />
                    )}
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
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {[t.speaker, t.duration].filter(Boolean).join(" • ")}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 0 && (
          <section>
            <SectionHeader title="Upcoming Meetings" href="/events" />
            <div className="space-y-2.5">
              {events.slice(0, 3).map((e) => (
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
                    <p className="text-xs text-muted-foreground truncate">
                      {formatDateTime(e.starts_at)} • {e.location}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-accent">{e.event_type}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="bg-navy text-navy-foreground rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-primary/40 blur-3xl rounded-full" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Ministry Announcement</p>
            <h3 className="font-display text-xl font-bold leading-tight">
              {announcement?.title ?? "We are a people raised to raise a righteous generation for Christ."}
            </h3>
            {announcement?.body && <p className="text-sm text-white/60 mt-2">{announcement.body}</p>}
            <Link to="/about" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
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
