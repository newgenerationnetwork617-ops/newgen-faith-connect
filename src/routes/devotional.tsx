import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { dailyDevotional } from "@/lib/mock-data";
import { Bookmark, Share2 } from "lucide-react";

export const Route = createFileRoute("/devotional")({
  head: () => ({
    meta: [
      { title: "Daily Devotional — New Generation Network" },
      { name: "description", content: dailyDevotional.title },
    ],
  }),
  component: DevotionalPage,
});

function DevotionalPage() {
  return (
    <MobileShell title="Devotional">
      {/* Cover */}
      <div className="relative">
        <div className="aspect-[16/10] bg-hero-gradient relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
          <div className="absolute inset-0 flex flex-col justify-end p-6 text-white">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/80">
              {dailyDevotional.theme}
            </span>
            <h1 className="font-display text-3xl font-bold leading-tight mt-2 text-balance">
              {dailyDevotional.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="px-5 py-6 space-y-6">
        {/* Meta */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Ministry of NGN • 5 min read</span>
          <div className="flex gap-2">
            <button className="size-9 rounded-full bg-muted grid place-items-center"><Bookmark className="size-4" /></button>
            <button className="size-9 rounded-full bg-muted grid place-items-center"><Share2 className="size-4" /></button>
          </div>
        </div>

        <Section label="Scripture" title={dailyDevotional.verse}>
          <p className="font-serif italic text-lg leading-relaxed text-primary">
            "For by grace you have been saved through faith, and that not of yourselves; it is the gift of God."
          </p>
        </Section>

        <Section label="Devotional">
          <p className="text-[15px] leading-relaxed text-foreground/90">{dailyDevotional.message}</p>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            Grace does not ask you to earn it. It simply asks you to receive it. Every believer stands upright
            not by their own strength but by the finished work of Christ. When you fail, grace runs faster than
            your regret. When you rise, grace is what lifted you.
          </p>
        </Section>

        <Section label="Life Application">
          <p className="text-[15px] leading-relaxed text-foreground/90">{dailyDevotional.application}</p>
        </Section>

        <Section label="Prayer">
          <div className="rounded-2xl bg-primary/5 border border-primary/10 p-5">
            <p className="font-serif italic text-lg leading-relaxed text-foreground">
              {dailyDevotional.prayer}
            </p>
          </div>
        </Section>

        <Section label="Memory Verse">
          <div className="rounded-2xl bg-navy text-navy-foreground p-5">
            <p className="font-serif italic text-lg leading-snug">"{dailyDevotional.memory}"</p>
          </div>
        </Section>
      </div>
    </MobileShell>
  );
}

function Section({ label, title, children }: { label: string; title?: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">{label}</span>
        {title && <span className="text-sm font-semibold text-muted-foreground">{title}</span>}
        <div className="flex-1 h-px bg-border" />
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
