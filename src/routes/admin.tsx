import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { useEffect, useState } from "react";
import {
  Lock, LogOut, Sparkles, Calendar, HandHeart, MessageCircle,
  Plus, Trash2, ShieldCheck, Check, Archive,
} from "lucide-react";
import {
  isAdminUnlocked, unlockAdmin, lockAdmin,
  useDevotionals, useMeetings, usePrayers, useTestimonies,
  type Devotional, type Meeting,
} from "@/lib/admin-store";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — New Generation Network" },
      { name: "description", content: "Manage devotionals, meetings, prayer requests and testimonies." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const [unlocked, setUnlocked] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    setUnlocked(isAdminUnlocked());
  }, []);

  if (!unlocked) {
    return (
      <MobileShell title="Admin">
        <div className="px-5 py-10 space-y-6">
          <div className="rounded-2xl bg-navy text-navy-foreground p-7 shadow-elegant relative overflow-hidden">
            <div className="absolute -right-8 -top-8 size-40 bg-primary/40 blur-3xl rounded-full" />
            <div className="relative">
              <ShieldCheck className="size-8 text-accent mb-3" />
              <h1 className="font-display text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-white/70 mt-2">
                Restricted access. Enter the admin password to manage ministry content.
              </p>
            </div>
          </div>

          <form
            className="space-y-3"
            onSubmit={(e) => {
              e.preventDefault();
              if (unlockAdmin(password)) {
                setUnlocked(true);
                setError(false);
              } else {
                setError(true);
              }
            }}
          >
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                autoFocus
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {error && (
              <p className="text-xs font-semibold text-destructive">Incorrect password. Try again.</p>
            )}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-hero-gradient text-white font-bold text-sm shadow-elegant"
            >
              Unlock Dashboard
            </button>
            <Link
              to="/"
              className="w-full block text-center py-3 rounded-xl bg-muted text-sm font-semibold text-muted-foreground"
            >
              Back to app
            </Link>
          </form>
        </div>
      </MobileShell>
    );
  }

  return <AdminDashboard onLock={() => { lockAdmin(); setUnlocked(false); setPassword(""); }} />;
}

type Tab = "devotional" | "meetings" | "prayers" | "testimonies";

function AdminDashboard({ onLock }: { onLock: () => void }) {
  const [tab, setTab] = useState<Tab>("devotional");

  return (
    <MobileShell title="Admin">
      <div className="px-5 py-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Admin</p>
            <h1 className="font-display text-xl font-bold">Ministry Dashboard</h1>
          </div>
          <button
            onClick={onLock}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-full bg-muted hover:bg-destructive/10 hover:text-destructive transition"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>

        <div className="grid grid-cols-4 gap-1 p-1 bg-muted rounded-xl">
          {([
            { id: "devotional", label: "Devotion", icon: Sparkles },
            { id: "meetings", label: "Meetings", icon: Calendar },
            { id: "prayers", label: "Prayers", icon: HandHeart },
            { id: "testimonies", label: "Testify", icon: MessageCircle },
          ] as const).map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex flex-col items-center justify-center gap-1 py-2 rounded-lg text-[11px] font-semibold transition ${
                tab === id ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              <Icon className="size-4" />
              {label}
            </button>
          ))}
        </div>

        {tab === "devotional" && <DevotionalManager />}
        {tab === "meetings" && <MeetingsManager />}
        {tab === "prayers" && <PrayersManager />}
        {tab === "testimonies" && <TestimoniesManager />}
      </div>
    </MobileShell>
  );
}

function DevotionalManager() {
  const [items, setItems] = useDevotionals();
  const today = new Date().toISOString().slice(0, 10);
  const [draft, setDraft] = useState<Devotional>({
    id: "",
    date: today,
    title: "",
    verse: "",
    message: "",
    prayer: "",
  });

  const add = () => {
    if (!draft.title.trim() || !draft.message.trim()) return;
    setItems([{ ...draft, id: crypto.randomUUID() }, ...items]);
    setDraft({ id: "", date: today, title: "", verse: "", message: "", prayer: "" });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <p className="font-display font-bold text-sm">New Devotional</p>
        <input
          type="date"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <input
          placeholder="Title (e.g. The Weight of Grace)"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <input
          placeholder="Scripture reference (e.g. Ephesians 2:8)"
          value={draft.verse}
          onChange={(e) => setDraft({ ...draft, verse: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <textarea
          placeholder="Devotional message..."
          rows={4}
          value={draft.message}
          onChange={(e) => setDraft({ ...draft, message: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm resize-none"
        />
        <textarea
          placeholder="Closing prayer..."
          rows={2}
          value={draft.prayer}
          onChange={(e) => setDraft({ ...draft, prayer: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm resize-none"
        />
        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-hero-gradient text-white text-sm font-semibold"
        >
          <Plus className="size-4" /> Publish devotional
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <EmptyState label="No devotionals yet. Publish the first one." />}
        {items.map((d) => (
          <div key={d.id} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.date}</p>
                <p className="font-display font-bold text-sm">{d.title}</p>
                <p className="text-xs text-primary mt-0.5">{d.verse}</p>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.message}</p>
              </div>
              <button
                onClick={() => setItems(items.filter((x) => x.id !== d.id))}
                className="size-8 grid place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function MeetingsManager() {
  const [items, setItems] = useMeetings();
  const [draft, setDraft] = useState<Meeting>({
    id: "", title: "", date: "", location: "", link: "", description: "",
  });

  const add = () => {
    if (!draft.title.trim() || !draft.date) return;
    setItems([{ ...draft, id: crypto.randomUUID() }, ...items]);
    setDraft({ id: "", title: "", date: "", location: "", link: "", description: "" });
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
        <p className="font-display font-bold text-sm">Host a Meeting</p>
        <input
          placeholder="Title (e.g. Youth Ignite Night)"
          value={draft.title}
          onChange={(e) => setDraft({ ...draft, title: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <input
          type="datetime-local"
          value={draft.date}
          onChange={(e) => setDraft({ ...draft, date: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <input
          placeholder="Location (or 'Live Online')"
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <input
          placeholder="Join link (optional)"
          value={draft.link}
          onChange={(e) => setDraft({ ...draft, link: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm"
        />
        <textarea
          placeholder="Description"
          rows={3}
          value={draft.description}
          onChange={(e) => setDraft({ ...draft, description: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg bg-muted border border-border text-sm resize-none"
        />
        <button
          onClick={add}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-hero-gradient text-white text-sm font-semibold"
        >
          <Plus className="size-4" /> Schedule meeting
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 && <EmptyState label="No meetings scheduled yet." />}
        {items.map((m) => (
          <div key={m.id} className="rounded-xl bg-card border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <p className="font-display font-bold text-sm">{m.title}</p>
                <p className="text-xs text-primary mt-0.5">
                  {new Date(m.date).toLocaleString()} • {m.location}
                </p>
                {m.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{m.description}</p>
                )}
              </div>
              <button
                onClick={() => setItems(items.filter((x) => x.id !== m.id))}
                className="size-8 grid place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PrayersManager() {
  const [items, setItems] = usePrayers();
  const setStatus = (id: string, status: "new" | "read" | "archived") =>
    setItems(items.map((p) => (p.id === id ? { ...p, status } : p)));

  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {items.filter((p) => p.status === "new").length} new • {items.length} total
      </p>
      {items.length === 0 && <EmptyState label="No prayer submissions yet." />}
      {items.map((p) => (
        <article key={p.id} className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-bold text-sm">
              {p.name}{" "}
              <span className="text-[10px] font-semibold uppercase tracking-widest text-primary ml-1">
                {p.kind}
              </span>
            </p>
            <span className="text-[10px] text-muted-foreground">
              {new Date(p.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{p.request}</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                p.status === "new"
                  ? "bg-primary/10 text-primary"
                  : p.status === "read"
                  ? "bg-muted text-muted-foreground"
                  : "bg-destructive/10 text-destructive"
              }`}
            >
              {p.status}
            </span>
            <div className="flex-1" />
            {p.status !== "read" && (
              <button
                onClick={() => setStatus(p.id, "read")}
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Check className="size-3.5" /> Mark read
              </button>
            )}
            {p.status !== "archived" && (
              <button
                onClick={() => setStatus(p.id, "archived")}
                className="flex items-center gap-1 text-xs font-semibold text-muted-foreground"
              >
                <Archive className="size-3.5" /> Archive
              </button>
            )}
            <button
              onClick={() => setItems(items.filter((x) => x.id !== p.id))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function TestimoniesManager() {
  const [items, setItems] = useTestimonies();
  return (
    <section className="space-y-3">
      <p className="text-xs text-muted-foreground">
        {items.filter((t) => !t.approved).length} pending • {items.length} total
      </p>
      {items.length === 0 && <EmptyState label="No testimonies received yet." />}
      {items.map((t) => (
        <article key={t.id} className="rounded-xl bg-card border border-border p-4">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-bold text-sm">{t.name}</p>
            <span className="text-[10px] text-muted-foreground">
              {new Date(t.createdAt).toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-foreground/85 leading-relaxed">{t.message}</p>
          <div className="mt-3 flex items-center gap-2">
            <span
              className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full ${
                t.approved ? "bg-accent/20 text-accent-foreground" : "bg-primary/10 text-primary"
              }`}
            >
              {t.approved ? "approved" : "pending"}
            </span>
            <div className="flex-1" />
            {!t.approved && (
              <button
                onClick={() =>
                  setItems(items.map((x) => (x.id === t.id ? { ...x, approved: true } : x)))
                }
                className="flex items-center gap-1 text-xs font-semibold text-primary"
              >
                <Check className="size-3.5" /> Approve
              </button>
            )}
            <button
              onClick={() => setItems(items.filter((x) => x.id !== t.id))}
              className="text-muted-foreground hover:text-destructive"
              aria-label="Delete"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </article>
      ))}
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="p-6 rounded-xl bg-muted/40 border border-dashed border-border text-center text-sm text-muted-foreground">
      {label}
    </div>
  );
}
