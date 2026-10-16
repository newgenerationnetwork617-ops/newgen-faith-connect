import { youtubeEmbed, youtubeId, youtubeThumb } from "@/lib/youtube";
import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Radio, Youtube, Calendar } from "lucide-react";
import { useLiveStream, useContactInfo, formatDateTime } from "@/lib/content";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Streaming — New Generation Network" },
      { name: "description", content: "Join our live services, prayer meetings and special broadcasts." },
      { property: "og:title", content: "Live Streaming — New Generation Network" },
      { property: "og:description", content: "Join our live services, prayer meetings and special broadcasts." },
      { property: "og:type", content: "video.other" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LivePage,
});

function LivePage() {
  const { data = [], isLoading } = useLiveStream();
  const { contact } = useContactInfo();
  const live = data.find((s) => s.is_live) ?? data[0];

  return (
    <MobileShell title="Live">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-navy text-navy-foreground overflow-hidden shadow-elegant">
          {youtubeEmbed(live?.youtube_id) ? (
            <div className="aspect-video">
              <iframe
                className="size-full"
                src={youtubeEmbed(live.youtube_id)!}
                title={live.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video bg-night-gradient grid place-items-center">
              <Radio className="size-10 text-white/60" />
            </div>
          )}
          <div className="p-5">
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                live?.is_live ? "bg-destructive text-white" : "bg-white/10 text-white/70"
              }`}
            >
              <Radio className="size-3" /> {live?.is_live ? "Live now" : "Offline"}
            </span>
            <h1 className="font-display text-xl font-bold mt-3">
              {isLoading ? "Loading…" : (live?.title ?? "No broadcast scheduled")}
            </h1>
            {live?.description && <p className="text-sm text-white/60 mt-1">{live.description}</p>}
            {live && !live.is_live && (
              <p className="flex items-center gap-1.5 text-xs text-white/50 mt-2">
                <Calendar className="size-3.5" /> Next: {formatDateTime(live.starts_at)}
              </p>
            )}
          </div>
        </section>

        <a
          href={contact.youtube}
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hero-gradient text-white text-sm font-bold shadow-elegant"
        >
          <Youtube className="size-4" /> Watch on NGN Official TV
        </a>

        {data.length > 1 && (
          <section className="space-y-2.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">Upcoming broadcasts</p>
            {data.slice(1).map((s) => (
              <div key={s.id} className="p-4 rounded-2xl bg-card border border-border">
                <p className="font-display font-bold text-sm">{s.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(s.starts_at)}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </MobileShell>
  );
}
