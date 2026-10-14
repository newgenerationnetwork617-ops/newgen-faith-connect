import { youtubeThumb } from "@/lib/youtube";
import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { dailyVerse } from "@/lib/mock-data";
import heroSunrise from "@/assets/hero-sunrise.jpg";
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
  { to: "/bible", label: "Bible", icon: BookOpen, tone: "text-primary" },
  { to: "/prayer", label: "Prayer", icon: HandHeart, tone: "text-accent" },
  { to: "/live", label: "Live", icon: Radio, tone: "text-primary", dot: true },
  { to: "/events", label: "Events", icon: Calendar, tone: "text-accent" },
  { to: "/teachings", label: "Teach", icon: Mic, tone: "text-primary" },
  { to: "/community", label: "Testify", icon: Users, tone: "text-accent" },
  { to: "/watch", label: "Films", icon: Play, tone: "text-primary" },
  { to: "/search", label: "Search", icon: Search, tone: "text-accent" },
] as const;

function HomePage() {
  const { devotional } = useLatestDevotional();
  const { data: teachings = [] } = useTeachings();
  const { data: events = [] } = useEvents();
  const { data: announcements = [] } = useAnnouncements();
  const announcement = announcements[0];
  const nextEvent = events[0];

  return (
    <MobileShell>
      <div className="space-y-7 px-6 pb-6 pt-2">
        <section className="glass rounded-3xl p-5">
          <div className="mb-3 flex items-center gap-2">
            <span className="h-4 w-1.5 rounded-full bg-accent" />
            <span className="font-display text-[10px] font-bold uppercase tracking-widest text-accent">Verse of the Day</span>
          </div>
          <p className="text-sm font-medium leading-relaxed">"{dailyVerse.text}"</p>
          <div className="mt-3 flex items-center justify-between">
            <p className="font-display text-xs font-semibold text-primary">
              {dailyVerse.reference} &bull; {dailyVerse.version}
            </p>
            <Link to="/bible" aria-label="Open Bible" className="text-xs font-bold text-primary">
              Read <ArrowRight className="inline size-3" />
            </Link>
          </div>
        </section>

        <section>
          <Link to="/devotional" className="group relative block h-[240px] overflow-hidden rounded-[36px] shadow-2xl">
            <img
              src={devotional?.cover_url || heroSunrise}
              alt={devotional?.title ?? "Sunrise over the mountains"}
              width={1024}
              height={640}
              className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
            <div className="absolute right-5 top-5 grid size-12 place-items-center rounded-full border border-white/30 bg-white/20 text-white backdrop-blur-md">
              <ArrowRight className="size-5" />
            </div>
            <div className="absolute inset-x-0 bottom-0 p-6 text-white">
              <span className="mb-2 inline-block rounded-full bg-primary px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest">
                {devotional ? devotional.theme || "Today's Devotional" : "Today's Devotional"}
              </span>
              <h2 className="font-display text-2xl font-bold leading-tight text-balance drop-shadow-lg">
                {devotional?.title ?? "A fresh word for every day"}
              </h2>
              <p className="mt-2 line-clamp-1 text-xs text-white/75">
                {devotional ? `${devotional.verse} • Tap to read` : "Scripture, reflection and prayer — coming soon"}
              </p>
            </div>
          </Link>
        </section>

        <section className="grid grid-cols-4 gap-x-3 gap-y-5">
          {quickTiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link key={t.to} to={t.to} className="group flex flex-col items-center gap-2">
                <div className={`glass relative grid size-16 place-items-center rounded-[22px] shadow-lg transition group-hover:-translate-y-0.5 ${t.tone}`}>
                  {"dot" in t && <span className="absolute right-2 top-2 size-2 rounded-full bg-destructive" />}
                  <Icon className="size-7" strokeWidth={1.6} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{t.label}</span>
              </Link>
            );
          })}
        </section>

        {nextEvent && (
          <Link to="/events" className="block rounded-[32px] bg-white p-6 text-navy shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="font-display text-base font-bold">Upcoming Meeting</h3>
              <span className="truncate text-[10px] font-bold uppercase text-primary">{nextEvent.location}</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="grid size-14 shrink-0 place-items-center rounded-2xl border border-navy/10 bg-navy/5 text-center leading-none">
                <div>
                  <div className="text-[10px] font-bold uppercase opacity-60">
                    {new Date(nextEvent.starts_at).toLocaleString("en", { month: "short" })}
                  </div>
                  <div className="font-display text-xl font-bold">{new Date(nextEvent.starts_at).getDate()}</div>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-sm font-bold">{nextEvent.title}</h4>
                <p className="truncate text-xs opacity-60">{formatDateTime(nextEvent.starts_at)}</p>
              </div>
            </div>
          </Link>
        )}

        {teachings.length > 0 && (
          <section className="space-y-4">
            <SectionHeader title="Latest Teachings" href="/teachings" />
            <div className="no-scrollbar -mx-6 flex gap-5 overflow-x-auto px-6 pb-2">
              {teachings.slice(0, 8).map((t) => (
                <Link key={t.id} to="/teachings" className="group w-56 shrink-0 space-y-3">
                  <div className="relative h-32 overflow-hidden rounded-3xl bg-night-gradient shadow-lg">
                    {(t.thumbnail_url || youtubeThumb(t.youtube_id)) && (
                      <img src={t.thumbnail_url || youtubeThumb(t.youtube_id)!} alt={t.title} loading="lazy" className="absolute inset-0 size-full object-cover" />
                    )}
                    <div className="absolute left-3 top-3 grid size-8 place-items-center rounded-full bg-white/90 text-primary">
                      <Play className="ml-0.5 size-3.5" fill="currentColor" />
                    </div>
                    {t.duration && (
                      <span className="absolute bottom-3 right-3 rounded-lg bg-navy/70 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                        {t.duration}
                      </span>
                    )}
                  </div>
                  <h5 className="line-clamp-2 text-xs font-semibold leading-snug">{t.title}</h5>
                </Link>
              ))}
            </div>
          </section>
        )}

        {events.length > 1 && (
          <section>
            <SectionHeader title="More Meetings" href="/events" />
            <div className="space-y-2.5">
              {events.slice(1, 4).map((e) => (
                <Link key={e.id} to="/events" className="glass flex items-center gap-4 rounded-2xl p-4">
                  <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    <Calendar className="size-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{formatDateTime(e.starts_at)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="relative overflow-hidden rounded-[32px] bg-hero-gradient p-6 text-white shadow-elegant">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/30 blur-3xl" />
          <div className="relative">
            <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-accent">
              <Sparkles className="size-3" /> Ministry Announcement
            </p>
            <h3 className="font-display text-xl font-bold leading-tight">
              {announcement?.title ?? "Raising a righteous generation for Christ."}
            </h3>
            {announcement?.body && <p className="mt-2 text-sm text-white/75">{announcement.body}</p>}
            <Link to="/about" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold">
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
      <h2 className="font-display text-lg font-bold">{title}</h2>
      <Link to={href} className="text-xs font-bold text-primary">
        Browse all
      </Link>
    </div>
  );
}
