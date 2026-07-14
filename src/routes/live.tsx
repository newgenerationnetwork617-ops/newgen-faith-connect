import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Radio, Bell } from "lucide-react";

export const Route = createFileRoute("/live")({
  head: () => ({ meta: [{ title: "Live — New Generation Network" }] }),
  component: LivePage,
});

function LivePage() {
  return (
    <MobileShell title="Live">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-navy text-navy-foreground overflow-hidden shadow-elegant">
          <div className="aspect-video bg-night-gradient relative">
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <div className="size-16 rounded-full bg-white/10 border border-white/20 grid place-items-center mx-auto mb-3 animate-pulse">
                  <Radio className="size-7 text-accent" />
                </div>
                <p className="text-white/70 text-sm">Next stream begins Sunday, 9:00 AM</p>
              </div>
            </div>
            <span className="absolute top-4 left-4 px-3 py-1 rounded-full bg-destructive/90 text-white text-[10px] font-bold uppercase tracking-widest">
              Offline
            </span>
          </div>
          <div className="p-5">
            <h1 className="font-display text-xl font-bold">Sunday Worship Service</h1>
            <p className="text-sm text-white/60 mt-1">Live worship, teaching, and communion.</p>
            <button className="mt-4 w-full flex items-center justify-center gap-2 py-3 rounded-full bg-hero-gradient text-white font-bold text-sm shadow-elegant">
              <Bell className="size-4" /> Remind Me
            </button>
          </div>
        </section>

        <section>
          <h2 className="font-display font-bold text-lg mb-3">Upcoming Streams</h2>
          <div className="space-y-2.5">
            {[
              { title: "Youth Ignite Night", date: "Fri, 7:00 PM" },
              { title: "Midweek Prayer", date: "Wed, 6:30 PM" },
              { title: "Sunday Worship", date: "Sun, 9:00 AM" },
            ].map((s) => (
              <div key={s.title} className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                <div>
                  <p className="font-display font-bold text-sm">{s.title}</p>
                  <p className="text-xs text-muted-foreground">{s.date}</p>
                </div>
                <button className="text-[11px] font-bold uppercase tracking-widest text-primary">Remind</button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
