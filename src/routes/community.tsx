import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Users, Send, Check, Heart } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useCommunityPosts, useTestimonies, submitCommunityPost, submitTestimony, formatDate,
} from "@/lib/content";

export const Route = createFileRoute("/community")({
  head: () => ({
    meta: [
      { title: "Community & Testimonies — New Generation Network" },
      { name: "description", content: "Share your testimony, encourage others and grow together in Christ." },
      { property: "og:title", content: "Community & Testimonies — New Generation Network" },
      { property: "og:description", content: "Share your testimony, encourage others and grow together in Christ." },
    ],
  }),
  component: CommunityPage,
});

function CommunityPage() {
  const [tab, setTab] = useState<"testimony" | "community">("testimony");
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { data: testimonies = [] } = useTestimonies();
  const { data: posts = [] } = useCommunityPosts();
  const qc = useQueryClient();

  const send = async () => {
    if (!text.trim()) return;
    setError("");
    try {
      if (tab === "testimony") {
        await submitTestimony({ name: name.trim() || "Anonymous", message: text.trim() });
        qc.invalidateQueries({ queryKey: ["testimonies"] });
      } else {
        await submitCommunityPost({ name: name.trim() || "Believer", body: text.trim() });
        qc.invalidateQueries({ queryKey: ["community_posts"] });
      }
      setText("");
      setSent(true);
      setTimeout(() => setSent(false), 2500);
    } catch {
      setError("Could not send right now. Please try again.");
    }
  };

  const feed = tab === "testimony"
    ? testimonies.map((t) => ({ id: t.id, name: t.name, body: t.message, at: t.created_at }))
    : posts.map((p) => ({ id: p.id, name: p.name, body: p.body, at: p.created_at }));

  return (
    <MobileShell title="Community">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-hero-gradient text-white p-6 shadow-elegant relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-white/15 blur-3xl rounded-full" />
          <div className="relative">
            <Users className="size-8 text-accent mb-3" />
            <h1 className="font-display text-2xl font-bold leading-tight">Raising a righteous generation, together.</h1>
            <p className="text-sm text-white/70 mt-2">Share what God is doing and encourage the family of faith.</p>
          </div>
        </section>

        <div className="flex p-1 bg-muted rounded-full">
          {(["testimony", "community"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                tab === t ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {t === "testimony" ? "Testimonies" : "Community"}
            </button>
          ))}
        </div>

        <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={80}
            placeholder="Your name (optional)"
            className="w-full text-sm bg-muted rounded-lg px-3 py-2.5 focus:outline-none"
          />
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, 2000))}
            rows={4}
            placeholder={tab === "testimony" ? "Share your testimony…" : "Share an encouragement…"}
            className="w-full text-sm bg-transparent resize-none focus:outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={send}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-hero-gradient text-white text-sm font-bold shadow-elegant"
          >
            {sent ? <><Check className="size-4" /> Sent for review</> : <><Send className="size-4" /> Share</>}
          </button>
          <p className="text-[11px] text-muted-foreground">Submissions appear here once the ministry approves them.</p>
          {error && <p className="text-xs text-destructive">{error}</p>}
        </div>

        <div className="space-y-3">
          {feed.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-6">Nothing published here yet.</p>
          )}
          {feed.map((item) => (
            <article key={item.id} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-display font-bold text-sm">{item.name}</p>
                <span className="text-[10px] text-muted-foreground">{formatDate(item.at)}</span>
              </div>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-line">{item.body}</p>
              <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                <Heart className="size-3.5" /> To God be the glory
              </span>
            </article>
          ))}
        </div>
      </div>
    </MobileShell>
  );
}
