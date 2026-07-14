import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import {
  User, Bell, Moon, Globe, Shield, Info, MessageSquare, FileText,
  Sparkles, Calendar, Radio, Mic, ChevronRight, LogIn,
} from "lucide-react";

export const Route = createFileRoute("/more")({
  head: () => ({ meta: [{ title: "More — New Generation Network" }] }),
  component: MorePage,
});

const explore = [
  { to: "/teachings", label: "Teachings", icon: Mic },
  { to: "/devotional", label: "Daily Devotional", icon: Sparkles },
  { to: "/live", label: "Live Streaming", icon: Radio },
  { to: "/events", label: "Events", icon: Calendar },
];

const settings = [
  { label: "Profile", icon: User, to: "/auth" as const },
  { label: "Notifications", icon: Bell, to: "/more" as const },
  { label: "Appearance", icon: Moon, to: "/more" as const },
  { label: "Language", icon: Globe, to: "/more" as const },
  { label: "Privacy", icon: Shield, to: "/more" as const },
];

const support = [
  { label: "About Us", icon: Info, to: "/about" as const },
  { label: "Contact Us", icon: MessageSquare, to: "/contact" as const },
  { label: "Terms & Conditions", icon: FileText, to: "/more" as const },
];

function MorePage() {
  return (
    <MobileShell title="More">
      <div className="px-5 py-6 space-y-6">
        {/* Sign in card */}
        <Link
          to="/auth"
          className="block rounded-2xl bg-hero-gradient text-white p-5 shadow-elegant relative overflow-hidden"
        >
          <div className="absolute -right-8 -top-8 size-32 bg-white/15 blur-3xl rounded-full" />
          <div className="relative flex items-center gap-4">
            <div className="size-12 rounded-full bg-white/20 grid place-items-center">
              <LogIn className="size-5" />
            </div>
            <div className="flex-1">
              <p className="font-display font-bold text-base">Sign in to sync</p>
              <p className="text-xs text-white/70">Bookmarks, notes, prayer & more.</p>
            </div>
            <ChevronRight className="size-5" />
          </div>
        </Link>

        <Group label="Explore">
          {explore.map((item) => (
            <Row key={item.label} {...item} />
          ))}
        </Group>

        <Group label="Settings">
          {settings.map((item) => (
            <Row key={item.label} {...item} />
          ))}
        </Group>

        <Group label="Support">
          {support.map((item) => (
            <Row key={item.label} {...item} />
          ))}
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

function Row({ to, label, icon: Icon }: { to: "/auth" | "/more" | "/about" | "/contact" | "/teachings" | "/devotional" | "/live" | "/events"; label: string; icon: React.ComponentType<{ className?: string }> }) {
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
