import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { HandHeart, Sparkles, Send, Check } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { usePrayerWall, submitPrayer, formatDate } from "@/lib/content";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer Wall — New Generation Network" },
      { name: "description", content: "Submit prayer requests, share praise reports, and stand together in prayer." },
      { property: "og:title", content: "Prayer Wall — New Generation Network" },
      { property: "og:description", content: "Send your prayer request to the ministry and read answered-prayer reports." },
    ],
  }),
  component: PrayerPage,
});

function PrayerPage() {
  const [tab, setTab] = useState<"prayer" | "praise">("prayer");
  const [text, setText] = useState("");
  const [name, setName] = useState("");
  const [anon, setAnon] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { data: feed = [] } = usePrayerWall(tab);
  const qc = useQueryClient();

  const handleSubmit = async () => {
    if (!text.trim()) return;
    setError("");
    try {
      await submitPrayer({
        name: anon ? "Anonymous" : name.trim() || "Believer",
        request: text.trim(),
        kind: tab,
      });
      setText("");
      setSent(true);
      qc.invalidateQueries({ queryKey: ["prayer_requests", tab] });
      setTimeout(() => setSent(false), 2500);
    } catch {
      setError("Could not send right now. Please try again.");
    }
  };

  return (
    <MobileShell title="Prayer Wall">
      <div className="px-5 py-6 space-y-6">
        <section className="bg-navy text-navy-foreground rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-40 bg-primary/40 blur-3xl rounded-full" />
          <div className="relative">
            <HandHeart className="size-8 text-accent mb-3" />
            <h1 className="font-display text-2xl font-bold leading-tight">
              Where two or three gather in My name, I am there.
            </h1>
            <p className="text-sm text-white/60 mt-2">— Matthew 18:20</p>
          </div>
        </section>

        <div className="flex p-1 bg-muted rounded-full">
          {(["prayer", "praise"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "prayer" ? "Prayer Requests" : "Praise Reports"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          {!anon && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={80}
              placeholder="Your name (optional)"
              className="w-full text-sm bg-muted rounded-lg px-3 py-2.5 focus:outline-none"
            />
          )}
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            placeholder={tab === "prayer" ? "Share your prayer request..." : "Share what God has done..."}
            rows={3}
            className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="rounded" checked={anon} onChange={(e) => setAnon(e.target.checked)} />
              Submit anonymously
            </label>
            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-hero-gradient text-white text-sm font-semibold shadow-elegant hover:opacity-95 transition"
            >
              {sent ? <><Check className="size-3.5" /> Sent</> : <><Send className="size-3.5" /> Submit</>}
            </button>
          </div>
          {sent && <p className="text-xs text-primary">Thank you — the ministry has received your submission.</p>}
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="space-y-3">
          {feed.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">
              Published {tab === "prayer" ? "prayer requests" : "praise reports"} will appear here.
            </p>
          )}
          {feed.map((p) => (
            <article key={p.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-sm">{p.name}</p>
                <span className="text-[10px] text-muted-foreground">{formatDate(p.created_at)}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{p.request}</p>
              <div className="mt-3">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" /> Standing in prayer
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
