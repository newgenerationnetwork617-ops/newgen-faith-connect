import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { prayerRequests } from "@/lib/mock-data";
import { HandHeart, Sparkles, Send } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/prayer")({
  head: () => ({
    meta: [
      { title: "Prayer Wall — New Generation Network" },
      { name: "description", content: "Submit prayer requests, share praise reports, and stand together in prayer." },
    ],
  }),
  component: PrayerPage,
});

function PrayerPage() {
  const [tab, setTab] = useState<"prayer" | "praise">("prayer");
  const [text, setText] = useState("");

  return (
    <MobileShell title="Prayer Wall">
      <div className="px-5 py-6 space-y-6">
        {/* Hero */}
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

        {/* Tabs */}
        <div className="flex p-1 bg-muted rounded-full">
          {(["prayer", "praise"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold capitalize transition ${
                tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "prayer" ? "Prayer Requests" : "Praise Reports"}
            </button>
          ))}
        </div>

        {/* Submit */}
        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={tab === "prayer" ? "Share your prayer request..." : "Share what God has done..."}
            rows={3}
            className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
          />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" className="rounded" />
              Submit anonymously
            </label>
            <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-hero-gradient text-white text-sm font-semibold shadow-elegant hover:opacity-95 transition">
              <Send className="size-3.5" /> Submit
            </button>
          </div>
        </div>

        {/* Feed */}
        <div className="space-y-3">
          {prayerRequests.map((p) => (
            <article key={p.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-sm">{p.name}</p>
                <span className="text-[10px] text-muted-foreground">{p.time}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed">{p.request}</p>
              <div className="mt-3 flex items-center justify-between">
                <button className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Sparkles className="size-3.5" /> I prayed
                </button>
                <span className="text-[10px] text-muted-foreground">{p.prayers} praying</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
