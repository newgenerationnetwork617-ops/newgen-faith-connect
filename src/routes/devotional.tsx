import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Bookmark, Share2, ChevronLeft, ChevronRight, Check, Sparkles } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { useDevotionals, formatDate } from "@/lib/content";

export const Route = createFileRoute("/devotional")({
  head: () => ({
    meta: [
      { title: "Daily Devotional — New Generation Network" },
      { name: "description", content: "A daily word of scripture, reflection, application and prayer." },
      { property: "og:title", content: "Daily Devotional — New Generation Network" },
      { property: "og:description", content: "A daily word of scripture, reflection, application and prayer." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DevotionalPage,
});

function DevotionalPage() {
  const { data = [], isLoading } = useDevotionals(30);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);
  const devotional = data[index];

  useEffect(() => {
    if (!devotional) return;
    try {
      setSaved(window.localStorage.getItem(`ngn-devotional-saved:${devotional.id}`) === "1");
    } catch {
      setSaved(false);
    }
  }, [devotional]);

  const toggleSaved = () => {
    if (!devotional) return;
    const next = !saved;
    setSaved(next);
    try {
      window.localStorage.setItem(`ngn-devotional-saved:${devotional.id}`, next ? "1" : "0");
    } catch {
      /* Saving is optional when device storage is unavailable. */
    }
  };

  const share = async () => {
    if (!devotional) return;
    const text = `${devotional.title}\n${devotional.verse}\n\n${devotional.message}`;
    try {
      if (navigator.share) await navigator.share({ title: devotional.title, text });
      else await navigator.clipboard.writeText(text);
      setShared(true);
      window.setTimeout(() => setShared(false), 1600);
    } catch {
      /* The reader may dismiss the share sheet. */
    }
  };

  if (isLoading) {
    return (
      <MobileShell title="Devotional">
        <div className="px-5 py-8 space-y-5 animate-pulse">
          <div className="aspect-[4/3] rounded-2xl bg-muted" />
          <div className="h-5 w-2/3 rounded bg-muted" />
          <div className="space-y-2"><div className="h-3 rounded bg-muted" /><div className="h-3 w-5/6 rounded bg-muted" /></div>
        </div>
      </MobileShell>
    );
  }

  if (!devotional) {
    return (
      <MobileShell title="Devotional">
        <div className="px-5 py-16 text-center">
          <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto"><Sparkles className="size-6" /></div>
          <h1 className="font-display font-bold text-xl mt-4">Your daily word is coming</h1>
          <p className="text-sm leading-relaxed text-muted-foreground mt-2 max-w-xs mx-auto">
            The ministry team is preparing scripture, reflection, life application and prayer for this space.
          </p>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Devotional">
      <div className="relative">
        <div className="aspect-[4/3] bg-night-gradient relative overflow-hidden">
          {devotional.cover_url && (
            <img src={devotional.cover_url} alt={devotional.title} className="absolute inset-0 size-full object-cover" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/50 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-navy-foreground">
            <span className="w-fit rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-accent-foreground">
              {devotional.theme || "Daily Bread"}
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight mt-2 text-balance">{devotional.title}</h1>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>New Generation Network • {formatDate(devotional.publish_at)}</span>
          <div className="flex gap-2">
            <button onClick={toggleSaved} aria-label={saved ? "Remove saved devotional" : "Save devotional"} className={`size-9 rounded-full grid place-items-center ${saved ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
              {saved ? <Check className="size-4" /> : <Bookmark className="size-4" />}
            </button>
            <button
              aria-label="Share"
              onClick={() => void share()}
              className="size-9 rounded-full bg-muted grid place-items-center"
            >
              {shared ? <Check className="size-4 text-primary" /> : <Share2 className="size-4" />}
            </button>
          </div>
        </div>

        {devotional.verse && <Section label="Scripture" title={devotional.verse} />}
        {devotional.message && (
          <Section label="Devotional">
            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">{devotional.message}</p>
          </Section>
        )}
        {devotional.application && (
          <Section label="Life Application">
            <p className="text-[15px] leading-relaxed text-foreground/90 whitespace-pre-line">{devotional.application}</p>
          </Section>
        )}
        {devotional.prayer && (
          <Section label="Prayer">
            <div className="rounded-xl bg-primary/5 border border-primary/10 p-5 border-l-4 border-l-primary">
              <p className="font-serif italic text-lg leading-relaxed">{devotional.prayer}</p>
            </div>
          </Section>
        )}
        {devotional.memory_verse && (
          <Section label="Memory Verse">
            <div className="rounded-xl bg-navy text-navy-foreground p-5 border-b-4 border-accent">
              <p className="font-serif italic text-lg leading-snug">"{devotional.memory_verse}"</p>
            </div>
          </Section>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            disabled={index >= data.length - 1}
            onClick={() => setIndex((i) => Math.min(i + 1, data.length - 1))}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary disabled:opacity-40"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>
          <button
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(i - 1, 0))}
            className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-primary disabled:opacity-40"
          >
            Newer <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </MobileShell>
  );
}

function Section({ label, title, children }: { label: string; title?: string; children?: ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</span>
        {title && <span className="text-sm font-semibold text-muted-foreground">{title}</span>}
        <div className="flex-1 h-px bg-border" />
      </div>
      {children && <div className="space-y-3">{children}</div>}
    </section>
  );
}
