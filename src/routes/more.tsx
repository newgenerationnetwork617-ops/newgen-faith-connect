import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import {
  Moon, Sun, Info, MessageSquare, Sparkles, Calendar, Radio, Mic, Users,
  ChevronRight, ShieldCheck, BookOpen, HandHeart, Search,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export const Route = createFileRoute("/more")({
  head: () => ({
    meta: [
      { title: "More — New Generation Network" },
      { name: "description", content: "Explore teachings, devotionals, live streams, events and settings on the NGN app." },
      { property: "og:title", content: "More — New Generation Network" },
      { property: "og:description", content: "Everything else in the NGN app: teachings, events, appearance settings and support." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MorePage,
});

type RowTo =
  | "/auth" | "/more" | "/about" | "/contact" | "/teachings" | "/devotional"
  | "/live" | "/events" | "/admin" | "/community" | "/bible" | "/prayer" | "/search";

type Item = { to: RowTo; label: string; icon: React.ComponentType<{ className?: string }> };

const explore: Item[] = [
  { to: "/teachings", label: "Teachings", icon: Mic },
  { to: "/devotional", label: "Daily Devotional", icon: Sparkles },
  { to: "/bible", label: "Holy Bible", icon: BookOpen },
  { to: "/prayer", label: "Prayer Wall", icon: HandHeart },
  { to: "/community", label: "Testimonies & Community", icon: Users },
  { to: "/live", label: "Live Streaming", icon: Radio },
  { to: "/events", label: "Events", icon: Calendar },
  { to: "/search", label: "Search", icon: Search },
];

const support: Item[] = [
  { label: "About Us", icon: Info, to: "/about" },
  { label: "Contact Us", icon: MessageSquare, to: "/contact" },
];

function MorePage() {
  const { theme, toggle } = useTheme();

  return (
    <MobileShell title="More">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-hero-gradient text-white p-5 shadow-elegant relative overflow-hidden">
          <div className="absolute -right-8 -top-8 size-32 bg-white/15 blur-3xl rounded-full" />
          <div className="relative">
            <p className="font-display font-bold text-base">Everything here is free</p>
            <p className="text-xs text-white/75 mt-1">
              No account needed. Read, watch, pray and share testimonies any time.
            </p>
          </div>
        </section>

        <Group label="Explore">
          {explore.map((item) => (
            <Row key={item.label} {...item} />
          ))}
        </Group>

        <Group label="Appearance">
          <button onClick={toggle} className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
            </div>
            <span className="flex-1 text-left text-sm font-semibold">
              {theme === "dark" ? "Dark mode" : "Light mode"}
            </span>
            <span
              className={`h-6 w-11 rounded-full p-0.5 transition ${theme === "dark" ? "bg-primary" : "bg-muted-foreground/30"}`}
            >
              <span
                className={`block size-5 rounded-full bg-card shadow transition ${theme === "dark" ? "translate-x-5" : ""}`}
              />
            </span>
          </button>
        </Group>

        <Group label="Support">
          {support.map((item) => (
            <Row key={item.label} {...item} />
          ))}
        </Group>

        <Group label="Ministry team">
          <Row to="/admin" label="Admin dashboard" icon={ShieldCheck} />
        </Group>

        <p className="text-center text-[11px] text-muted-foreground pt-2">
          New Generation Network • v1.0<br />
          "Raising a Righteous Generation for Christ."
        </p>
      </div>
    </MobileShell>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section>
      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1 mb-2">{label}</p>
      <div className="rounded-2xl bg-card border border-border overflow-hidden divide-y divide-border">
        {children}
      </div>
    </section>
  );
}

function Row({ to, label, icon: Icon }: Item) {
  return (
    <Link to={to} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition">
      <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <span className="flex-1 text-sm font-semibold">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </Link>
  );
}
