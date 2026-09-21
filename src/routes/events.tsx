import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Calendar, MapPin } from "lucide-react";
import { useEvents, formatDateTime } from "@/lib/content";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Meetings — New Generation Network" },
      { name: "description", content: "Services, conferences and online gatherings hosted by New Generation Network." },
      { property: "og:title", content: "Events & Meetings — New Generation Network" },
      { property: "og:description", content: "Services, conferences and online gatherings hosted by New Generation Network." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EventsPage,
});

function EventsPage() {
  const { data = [], isLoading } = useEvents();

  return (
    <MobileShell title="Events">
      <div className="px-5 py-6 space-y-4">
        <div className="rounded-2xl p-6 bg-hero-gradient text-white shadow-elegant">
          <p className="text-[10px] uppercase tracking-widest text-white/70 font-bold mb-2">Ministry Events</p>
          <h1 className="font-display text-2xl font-bold leading-tight">Come and encounter Jesus with us.</h1>
        </div>

        {isLoading && <p className="text-sm text-muted-foreground">Loading events…</p>}
        {!isLoading && data.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-6">No meetings scheduled yet.</p>
        )}

        {data.map((e) => (
          <article key={e.id} className="rounded-2xl bg-card border border-border overflow-hidden">
            <div className="aspect-[16/7] bg-night-gradient relative">
              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/90 text-primary text-[10px] font-bold uppercase tracking-widest">
                {e.event_type}
              </span>
            </div>
            <div className="p-5 space-y-2">
              <h3 className="font-display text-lg font-bold">{e.title}</h3>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><Calendar className="size-3.5" /> {formatDateTime(e.starts_at)}</span>
                {e.location && <span className="flex items-center gap-1.5"><MapPin className="size-3.5" /> {e.location}</span>}
              </div>
              {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
              {e.link && (
                <a
                  href={e.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block px-5 py-2 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-widest"
                >
                  Join / Register
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </MobileShell>
  );
}
