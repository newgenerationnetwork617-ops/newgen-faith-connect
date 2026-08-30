import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Bookmark, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { useDevotionals, formatDate } from "@/lib/content";

export const Route = createFileRoute("/devotional")({
  head: () => ({
    meta: [
      { title: "Daily Devotional — New Generation Network" },
      { name: "description", content: "A daily word of scripture, reflection, application and prayer." },
      { property: "og:title", content: "Daily Devotional — New Generation Network" },
      { property: "og:description", content: "A daily word of scripture, reflection, application and prayer." },
    ],
  }),
  component: DevotionalPage,
});

function DevotionalPage() {
  const { data = [], isLoading } = useDevotionals(30);
  const [index, setIndex] = useState(0);
  const devotional = data[index];

  if (isLoading) {
    return (
      <MobileShell title="Devotional">
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">Loading today's word…</div>
      </MobileShell>
    );
  }

  if (!devotional) {
    return (
      <MobileShell title="Devotional">
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">
          No devotional has been published yet. Please check back soon.
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Devotional">
      <div className="relative">
        <div className="aspect-[16/10] bg-hero-gradient relative overflow-hidden">
          {devotional.cover_url && (
            <img src={devotional.cover_url} alt={devotional.title} className="absolute inset-0 size-full object-cover" />
          )}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
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
            <button aria-label="Save" className="size-9 rounded-full bg-muted grid place-items-center"><Bookmark className="size-4" /></button>
            <button
              aria-label="Share"
              onClick={() => {
                if (typeof navigator !== "undefined" && navigator.share) {
                  void navigator.share({ title: devotional.title, text: devotional.verse });
                }
              }}
              className="size-9 rounded-full bg-muted grid place-items-center"
            >
              <Share2 className="size-4" />
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
            <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
              <p className="font-serif italic text-lg leading-relaxed">{devotional.prayer}</p>
            </div>
          </Section>
        )}
        {devotional.memory_verse && (
          <Section label="Memory Verse">
            <div className="rounded-2xl bg-navy text-navy-foreground p-5">
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

function Section({ label, title, children }: { label: string; title?: string; children?: React.ReactNode }) {
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
