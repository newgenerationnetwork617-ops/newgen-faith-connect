import { youtubeThumb } from "@/lib/youtube";
import { createFileRoute, Link } from "@tanstack/react-router";
import { SiteShell } from "@/components/site-shell";
import heroSunrise from "@/assets/hero-sunrise.jpg";
import logo from "@/assets/ngn-mark.png.asset.json";
import { ArrowRight, BookOpen, Calendar, Download, HandHeart, Mic, Play, Smartphone, Sparkles } from "lucide-react";
import {
  useLatestDevotional, useTeachings, useEvents, useAnnouncements, useBooks, formatDate, formatDateTime,
} from "@/lib/content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "New Generation Network — Raising a Righteous Generation for Christ" },
      { name: "description", content: "The official website of New Generation Network: daily devotionals, teachings, devotion books, events and prayer." },
      { property: "og:title", content: "New Generation Network — Raising a Righteous Generation" },
      { property: "og:description", content: "Daily devotionals, teachings, devotion books, events and prayer from New Generation Network." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const { devotional } = useLatestDevotional();
  const { data: teachings = [] } = useTeachings();
  const { data: events = [] } = useEvents();
  const { data: books = [] } = useBooks();
  const { data: announcements = [] } = useAnnouncements();
  const upcoming = events.filter((e) => new Date(e.starts_at).getTime() > Date.now() - 864e5).slice(0, 3);

  return (
    <SiteShell>
      <section className="bg-sky-wash px-5 pb-10 pt-12 text-center">
        <img src={logo.url} alt="New Generation Network logo" className="mx-auto size-28 rounded-full bg-logo-surface object-contain shadow-elegant" />
        <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.25em] text-primary">New Generation Network</p>
        <h1 className="mx-auto mt-3 max-w-xl font-display text-4xl font-extrabold leading-[1.1] text-balance sm:text-5xl">
          Raising a righteous generation for Christ
        </h1>
        <p className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed text-muted-foreground">
          Daily devotionals, sound teachings, devotion books and gatherings that build faith.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link to="/devotional" className="inline-flex items-center gap-2 rounded-full bg-hero-gradient px-6 py-3 text-sm font-bold text-primary-foreground shadow-elegant">
            Today's devotional <ArrowRight className="size-4" />
          </Link>
          <Link to="/teachings" className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-6 py-3 text-sm font-bold">
            Watch teachings
          </Link>
        </div>
      </section>

      <div className="space-y-12 px-5 pb-14">
        <Link to="/devotional" className="group relative block h-[280px] overflow-hidden rounded-[32px] shadow-elegant">
          <img src={devotional?.cover_url || heroSunrise} alt={devotional?.title ?? "Sunrise over the mountains"} width={1024} height={640} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-7 text-navy-foreground">
            <span className="mb-2 inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
              {devotional?.theme || "Today's Devotional"}
            </span>
            <h2 className="font-display text-2xl font-bold leading-tight text-balance">{devotional?.title ?? "A fresh word for every day"}</h2>
            <p className="mt-2 line-clamp-1 text-sm opacity-80">{devotional ? `${devotional.verse} • Read now` : "Scripture, reflection and prayer — coming soon"}</p>
          </div>
        </Link>

        <section>
          <SectionHeader eyebrow="Latest drops" title="New teachings" href="/teachings" />
          {teachings.length === 0 ? (
            <Empty text="New teachings will appear here as soon as they're published." />
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {teachings.slice(0, 6).map((t) => {
                const thumb = t.thumbnail_url || youtubeThumb(t.youtube_id);
                return (
                  <Link key={t.id} to="/teachings" search={{ teaching: t.id }} className="group space-y-3">
                    <div className="relative aspect-video overflow-hidden rounded-3xl bg-night-gradient shadow-soft">
                      {thumb && <img src={thumb} alt={t.title} loading="lazy" className="absolute inset-0 size-full object-cover transition group-hover:scale-105" />}
                      <div className="absolute left-3 top-3 grid size-9 place-items-center rounded-full bg-card/90 text-primary">
                        <Play className="ml-0.5 size-4" fill="currentColor" />
                      </div>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-primary">{t.topic || t.kind}</p>
                      <h3 className="mt-0.5 line-clamp-2 font-display text-sm font-bold leading-snug">{t.title}</h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {books.length > 0 && (
          <section>
            <SectionHeader eyebrow="Library" title="Devotion books" href="/teachings" search={{ tab: "books" }} />
            <div className="grid gap-3">
              {books.slice(0, 3).map((b) => (
                <Link key={b.id} to="/teachings" search={{ tab: "books" }} className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><BookOpen className="size-5" /></div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-display text-sm font-bold">{b.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{b.author || "New Generation Network"} • {formatDate(b.publish_at)}</p>
                  </div>
                  <Download className="size-4 text-primary" />
                </Link>
              ))}
            </div>
          </section>
        )}

        <section>
          <SectionHeader eyebrow="Gather with us" title="Upcoming meetings" href="/events" />
          {upcoming.length === 0 ? (
            <Empty text="New meetings will be announced here." />
          ) : (
            <div className="grid gap-3">
              {upcoming.map((e) => (
                <Link key={e.id} to="/events" className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft">
                  <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-secondary text-center leading-none">
                    <div>
                      <div className="text-[10px] font-bold uppercase text-primary">{new Date(e.starts_at).toLocaleString("en", { month: "short" })}</div>
                      <div className="font-display text-xl font-bold">{new Date(e.starts_at).getDate()}</div>
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-sm font-bold">{e.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{formatDateTime(e.starts_at)}{e.location ? ` • ${e.location}` : ""}</p>
                  </div>
                  <Calendar className="size-4 text-primary" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="grid gap-3 sm:grid-cols-3">
          <QuickCard to="/about" icon={Sparkles} title="Our vision" text="Who we are and what we believe." />
          <QuickCard to="/prayer" icon={HandHeart} title="Prayer" text="Send a request — we'll stand with you." />
          <QuickCard to="/teachings" icon={Mic} title="Teachings" text="Videos, audio and studies." />
        </section>

        {announcements[0] && (
          <section className="rounded-[28px] border border-border bg-secondary p-6">
            <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Ministry announcement</p>
            <h3 className="mt-2 font-display text-xl font-bold">{announcements[0].title}</h3>
            {announcements[0].body && <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{announcements[0].body}</p>}
          </section>
        )}

        <Link to="/get-app" className="relative flex items-center gap-5 overflow-hidden rounded-[32px] bg-hero-gradient p-7 text-primary-foreground shadow-elegant">
          <div className="absolute -right-10 -top-10 size-40 rounded-full bg-accent/40 blur-3xl" />
          <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-card/20"><Smartphone className="size-7" /></div>
          <div className="relative min-w-0 flex-1">
            <h3 className="font-display text-lg font-bold">Get the NGN app</h3>
            <p className="text-sm opacity-85">Download the ministry's Android app.</p>
          </div>
          <ArrowRight className="relative size-5" />
        </Link>
      </div>
    </SiteShell>
  );
}

function SectionHeader({ eyebrow, title, href, search }: { eyebrow: string; title: string; href: "/teachings" | "/events"; search?: { tab: "books" } }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-3">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{eyebrow}</p>
        <h2 className="font-display text-2xl font-bold">{title}</h2>
      </div>
      <Link to={href} search={search as never} className="text-xs font-bold text-primary">View all</Link>
    </div>
  );
}

function QuickCard({ to, icon: Icon, title, text }: { to: "/about" | "/prayer" | "/teachings"; icon: React.ComponentType<{ className?: string }>; title: string; text: string }) {
  return (
    <Link to={to} className="rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
      <div className="mb-3 grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></div>
      <p className="font-display text-sm font-bold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{text}</p>
    </Link>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{text}</p>;
}
