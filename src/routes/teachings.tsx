import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { latestTeachings } from "@/lib/mock-data";
import { Search, Play, Headphones, BookOpenCheck } from "lucide-react";

export const Route = createFileRoute("/teachings")({
  head: () => ({
    meta: [
      { title: "Teachings & Sermons — New Generation Network" },
      { name: "description", content: "Video and audio teachings, Bible studies, and teaching series." },
    ],
  }),
  component: TeachingsPage,
});

const tabs = [
  { key: "video", label: "Video", icon: Play },
  { key: "audio", label: "Audio", icon: Headphones },
  { key: "studies", label: "Studies", icon: BookOpenCheck },
];

function TeachingsPage() {
  return (
    <MobileShell title="Teachings">
      <div className="px-5 py-6 space-y-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            placeholder="Search by topic or speaker"
            className="w-full pl-11 pr-4 py-3 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {tabs.map((t, i) => (
            <button
              key={t.key}
              className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border transition ${
                i === 0
                  ? "bg-primary text-primary-foreground border-transparent"
                  : "bg-card border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              <t.icon className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-wider">{t.label}</span>
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {latestTeachings.map((t) => (
            <article key={t.id} className="flex gap-3 p-3 rounded-2xl bg-card border border-border hover:border-primary/30 transition">
              <div className="w-24 aspect-[4/3] rounded-lg bg-night-gradient relative overflow-hidden shrink-0">
                <div className="absolute inset-0 grid place-items-center">
                  <Play className="size-4 text-white" fill="currentColor" />
                </div>
              </div>
              <div className="flex-1 min-w-0 py-1">
                <p className="text-[10px] uppercase tracking-widest text-accent font-bold">{t.topic}</p>
                <h3 className="font-display font-bold text-sm leading-snug mt-0.5 line-clamp-2">{t.title}</h3>
                <p className="text-[11px] text-muted-foreground mt-1">{t.speaker} • {t.duration}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
