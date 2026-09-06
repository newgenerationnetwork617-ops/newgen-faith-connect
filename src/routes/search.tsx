import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Search as SearchIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { useDevotionals, useTeachings, useEvents, formatDate } from "@/lib/content";

export const Route = createFileRoute("/search")({
  head: () => ({
    meta: [
      { title: "Search — New Generation Network" },
      { name: "description", content: "Search devotionals, teachings, films and events across the ministry." },
      { property: "og:title", content: "Search — New Generation Network" },
      { property: "og:description", content: "Search devotionals, teachings, films and events across the ministry." },
    ],
  }),
  component: SearchPage,
});

function SearchPage() {
  const [term, setTerm] = useState("");
  const { data: devotionals = [] } = useDevotionals(50);
  const { data: teachings = [] } = useTeachings();
  const { data: events = [] } = useEvents();

  const q = term.trim().toLowerCase();

  const results = useMemo(() => {
    if (!q) return [];
    const hits: { id: string; title: string; sub: string; to: "/devotional" | "/teachings" | "/events" }[] = [];
    devotionals.forEach((d) => {
      if (`${d.title} ${d.theme} ${d.verse} ${d.message}`.toLowerCase().includes(q))
        hits.push({ id: `d-${d.id}`, title: d.title, sub: `Devotional • ${formatDate(d.publish_at)}`, to: "/devotional" });
    });
    teachings.forEach((t) => {
      if (`${t.title} ${t.speaker} ${t.topic} ${t.series ?? ""}`.toLowerCase().includes(q))
        hits.push({ id: `t-${t.id}`, title: t.title, sub: `Teaching • ${t.speaker}`, to: "/teachings" });
    });
    events.forEach((e) => {
      if (`${e.title} ${e.location} ${e.event_type}`.toLowerCase().includes(q))
        hits.push({ id: `e-${e.id}`, title: e.title, sub: `Event • ${formatDate(e.starts_at)}`, to: "/events" });
    });
    return hits;
  }, [q, devotionals, teachings, events]);

  return (
    <MobileShell title="Search">
      <div className="px-5 py-6 space-y-5">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            autoFocus
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search devotionals, teachings, events"
            className="w-full pl-11 pr-4 py-3.5 rounded-full bg-muted border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        {!q && <p className="text-sm text-muted-foreground text-center py-8">Type to search the whole app.</p>}
        {q && results.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No results for "{term}".</p>
        )}

        <div className="space-y-2.5">
          {results.map((r) => (
            <Link key={r.id} to={r.to} className="block p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition">
              <p className="font-display font-bold text-sm">{r.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{r.sub}</p>
            </Link>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
