import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Lock, LogOut, Sparkles, Calendar, HandHeart, MessageCircle, Megaphone,
  Mic, Radio, Users, Phone, Plus, Trash2, ShieldCheck, Check, X,
} from "lucide-react";
import {
  adminLogin, adminLogout, adminStatus, adminFetch, adminUpsert, adminDelete,
  type AdminRow,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Dashboard — New Generation Network" },
      { name: "description", content: "Manage devotionals, teachings, events, prayer requests and testimonies." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

type FieldType = "text" | "textarea" | "datetime" | "bool" | "list";
type Field = { key: string; label: string; type: FieldType; placeholder?: string };

type TabDef = {
  key: string;
  table: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  fields: Field[];
  titleKey: string;
  subtitleKeys: string[];
  creatable: boolean;
  singleton?: boolean;
};

const TABS: TabDef[] = [
  {
    key: "devotionals", table: "devotionals", label: "Devotionals", icon: Sparkles, creatable: true,
    titleKey: "title", subtitleKeys: ["theme", "verse"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "theme", label: "Theme", type: "text" },
      { key: "verse", label: "Scripture reference", type: "text" },
      { key: "message", label: "Devotional message", type: "textarea" },
      { key: "application", label: "Life application", type: "textarea" },
      { key: "prayer", label: "Prayer", type: "textarea" },
      { key: "memory_verse", label: "Memory verse", type: "textarea" },
      { key: "cover_url", label: "Cover image URL", type: "text" },
      { key: "publish_at", label: "Publish date", type: "datetime" },
      { key: "published", label: "Published", type: "bool" },
    ],
  },
  {
    key: "teachings", table: "teachings", label: "Teachings", icon: Mic, creatable: true,
    titleKey: "title", subtitleKeys: ["speaker", "kind"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "speaker", label: "Speaker", type: "text" },
      { key: "topic", label: "Topic", type: "text" },
      { key: "series", label: "Series", type: "text" },
      { key: "kind", label: "Type (video / audio / study)", type: "text" },
      { key: "youtube_id", label: "YouTube video ID", type: "text", placeholder: "e.g. dQw4w9WgXcQ" },
      { key: "media_url", label: "Audio / file URL", type: "text" },
      { key: "thumbnail_url", label: "Thumbnail URL", type: "text" },
      { key: "duration", label: "Duration", type: "text", placeholder: "42:10" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "publish_at", label: "Publish date", type: "datetime" },
      { key: "published", label: "Published", type: "bool" },
    ],
  },
  {
    key: "events", table: "events", label: "Meetings", icon: Calendar, creatable: true,
    titleKey: "title", subtitleKeys: ["location", "event_type"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "starts_at", label: "Date & time", type: "datetime" },
      { key: "location", label: "Location", type: "text" },
      { key: "event_type", label: "Type", type: "text", placeholder: "Service, Conference, Online" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "link", label: "Meeting / registration link", type: "text" },
      { key: "published", label: "Published", type: "bool" },
    ],
  },
  {
    key: "announcements", table: "announcements", label: "Notices", icon: Megaphone, creatable: true,
    titleKey: "title", subtitleKeys: ["body"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "body", label: "Message", type: "textarea" },
      { key: "publish_at", label: "Publish date", type: "datetime" },
      { key: "published", label: "Published", type: "bool" },
    ],
  },
  {
    key: "live", table: "live_streams", label: "Live", icon: Radio, creatable: true,
    titleKey: "title", subtitleKeys: ["youtube_id"],
    fields: [
      { key: "title", label: "Title", type: "text" },
      { key: "youtube_id", label: "YouTube video / live ID", type: "text" },
      { key: "starts_at", label: "Starts at", type: "datetime" },
      { key: "is_live", label: "Currently live", type: "bool" },
      { key: "description", label: "Description", type: "textarea" },
    ],
  },
  {
    key: "prayers", table: "prayer_requests", label: "Prayers", icon: HandHeart, creatable: false,
    titleKey: "name", subtitleKeys: ["request"],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "request", label: "Request", type: "textarea" },
      { key: "kind", label: "Kind", type: "text" },
      { key: "status", label: "Status", type: "text" },
      { key: "approved", label: "Show on prayer wall", type: "bool" },
    ],
  },
  {
    key: "testimonies", table: "testimonies", label: "Testimonies", icon: MessageCircle, creatable: false,
    titleKey: "name", subtitleKeys: ["message"],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "message", label: "Testimony", type: "textarea" },
      { key: "approved", label: "Approved", type: "bool" },
    ],
  },
  {
    key: "community", table: "community_posts", label: "Community", icon: Users, creatable: false,
    titleKey: "name", subtitleKeys: ["body"],
    fields: [
      { key: "name", label: "Name", type: "text" },
      { key: "body", label: "Post", type: "textarea" },
      { key: "approved", label: "Approved", type: "bool" },
    ],
  },
  {
    key: "contact", table: "contact_info", label: "Contact", icon: Phone, creatable: false, singleton: true,
    titleKey: "email", subtitleKeys: ["youtube"],
    fields: [
      { key: "whatsapp_numbers", label: "WhatsApp numbers (one per line)", type: "list" },
      { key: "email", label: "Email", type: "text" },
      { key: "youtube", label: "YouTube channel URL", type: "text" },
      { key: "facebook", label: "Facebook URL", type: "text" },
      { key: "instagram", label: "Instagram URL", type: "text" },
      { key: "address", label: "Address", type: "textarea" },
    ],
  },
];

function AdminPage() {
  const status = useServerFn(adminStatus);
  const login = useServerFn(adminLogin);
  const logout = useServerFn(adminLogout);
  const [unlocked, setUnlocked] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    status({}).then((r) => setUnlocked(r.unlocked)).catch(() => setUnlocked(false));
  }, [status]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const res = await login({ data: { password } });
    if (res.ok) {
      setUnlocked(true);
      setPassword("");
    } else {
      setError("Incorrect password.");
    }
  };

  if (unlocked === null) {
    return (
      <MobileShell title="Admin">
        <div className="px-5 py-16 text-center text-sm text-muted-foreground">Checking access…</div>
      </MobileShell>
    );
  }

  if (!unlocked) {
    return (
      <MobileShell title="Admin">
        <div className="px-5 py-10 space-y-6">
          <div className="rounded-2xl bg-navy text-navy-foreground p-7 relative overflow-hidden">
            <div className="absolute -right-10 -top-10 size-40 bg-primary/40 blur-3xl rounded-full" />
            <div className="relative">
              <ShieldCheck className="size-8 text-accent mb-3" />
              <h1 className="font-display text-2xl font-bold leading-tight">Ministry Admin</h1>
              <p className="text-sm text-white/60 mt-2">
                Manage devotionals, teachings, meetings, prayer requests and testimonies.
              </p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-3">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Admin password"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-hero-gradient text-white font-bold text-sm shadow-elegant"
            >
              Unlock Dashboard
            </button>
          </form>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Admin">
      <Dashboard
        onLogout={async () => {
          await logout({});
          setUnlocked(false);
        }}
      />
    </MobileShell>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tabKey, setTabKey] = useState(TABS[0]!.key);
  const tab = useMemo(() => TABS.find((t) => t.key === tabKey)!, [tabKey]);
  const fetchRows = useServerFn(adminFetch);
  const upsert = useServerFn(adminUpsert);
  const remove = useServerFn(adminDelete);
  const qc = useQueryClient();
  const [editing, setEditing] = useState<AdminRow | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin", tab.table],
    queryFn: () => fetchRows({ data: { table: tab.table } }),
  });

  const saveMutation = useMutation({
    mutationFn: (row: AdminRow) => upsert({ data: { table: tab.table, row } }),
    onSuccess: () => {
      setEditing(null);
      qc.invalidateQueries({ queryKey: ["admin", tab.table] });
      qc.invalidateQueries();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => remove({ data: { table: tab.table, id } }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", tab.table] });
      qc.invalidateQueries();
    },
  });

  const rows = data?.rows ?? [];

  return (
    <div className="px-5 py-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold">Signed in</p>
          <h1 className="font-display text-xl font-bold">Content Dashboard</h1>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
        >
          <LogOut className="size-3.5" /> Lock
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-5 px-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTabKey(t.key); setEditing(null); }}
            className={`flex-none flex items-center gap-1.5 px-3.5 py-2 rounded-full border text-xs font-bold transition ${
              t.key === tabKey
                ? "bg-primary text-primary-foreground border-transparent"
                : "bg-card border-border text-muted-foreground"
            }`}
          >
            <t.icon className="size-3.5" /> {t.label}
          </button>
        ))}
      </div>

      {tab.creatable && !editing && (
        <button
          onClick={() => setEditing({})}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-hero-gradient text-white text-sm font-bold shadow-elegant"
        >
          <Plus className="size-4" /> New {tab.label.replace(/s$/, "")}
        </button>
      )}

      {editing && (
        <RowEditor
          tab={tab}
          row={editing}
          saving={saveMutation.isPending}
          onCancel={() => setEditing(null)}
          onSave={(row) => saveMutation.mutate(row)}
        />
      )}

      {saveMutation.isError && (
        <p className="text-xs text-destructive">Could not save. Please try again.</p>
      )}

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="space-y-2.5">
          {rows.map((row) => (
            <article key={String(row["id"])} className="rounded-2xl bg-card border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">
                    {String(row[tab.titleKey] ?? "Untitled")}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                    {tab.subtitleKeys.map((k) => row[k]).filter(Boolean).join(" • ")}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {"approved" in row && (
                    <button
                      aria-label="Toggle approval"
                      onClick={() =>
                        saveMutation.mutate({ id: String(row["id"]), approved: !row["approved"] })
                      }
                      className={`size-8 rounded-lg grid place-items-center ${
                        row["approved"] ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {row["approved"] ? <Check className="size-4" /> : <X className="size-4" />}
                    </button>
                  )}
                  <button
                    onClick={() => setEditing(row)}
                    className="px-3 h-8 rounded-lg bg-muted text-xs font-bold"
                  >
                    Edit
                  </button>
                  {!tab.singleton && (
                    <button
                      aria-label="Delete"
                      onClick={() => deleteMutation.mutate(String(row["id"]))}
                      className="size-8 rounded-lg bg-destructive/10 text-destructive grid place-items-center"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

function RowEditor({
  tab, row, saving, onCancel, onSave,
}: {
  tab: TabDef;
  row: AdminRow;
  saving: boolean;
  onCancel: () => void;
  onSave: (row: AdminRow) => void;
}) {
  const [draft, setDraft] = useState<AdminRow>(row);

  const set = (key: string, value: string | boolean | string[] | null) =>
    setDraft((d) => ({ ...d, [key]: value }));

  return (
    <div className="rounded-2xl bg-card border border-border p-4 space-y-3">
      {tab.fields.map((field) => {
        const value = draft[field.key];
        if (field.type === "bool") {
          return (
            <label key={field.key} className="flex items-center justify-between text-sm font-semibold">
              {field.label}
              <input
                type="checkbox"
                checked={value === true}
                onChange={(e) => set(field.key, e.target.checked)}
                className="size-4"
              />
            </label>
          );
        }
        if (field.type === "list") {
          const text = Array.isArray(value) ? value.join("\n") : "";
          return (
            <FieldWrap key={field.key} label={field.label}>
              <textarea
                rows={4}
                value={text}
                onChange={(e) =>
                  set(field.key, e.target.value.split("\n").map((v) => v.trim()).filter(Boolean))
                }
                className="w-full text-sm bg-muted rounded-lg p-3 focus:outline-none"
              />
            </FieldWrap>
          );
        }
        if (field.type === "textarea") {
          return (
            <FieldWrap key={field.key} label={field.label}>
              <textarea
                rows={4}
                value={typeof value === "string" ? value : ""}
                placeholder={field.placeholder}
                onChange={(e) => set(field.key, e.target.value)}
                className="w-full text-sm bg-muted rounded-lg p-3 focus:outline-none"
              />
            </FieldWrap>
          );
        }
        const isDate = field.type === "datetime";
        const inputValue = isDate
          ? typeof value === "string" && value
            ? new Date(value).toISOString().slice(0, 16)
            : ""
          : typeof value === "string"
            ? value
            : "";
        return (
          <FieldWrap key={field.key} label={field.label}>
            <input
              type={isDate ? "datetime-local" : "text"}
              value={inputValue}
              placeholder={field.placeholder}
              onChange={(e) =>
                set(field.key, isDate && e.target.value ? new Date(e.target.value).toISOString() : e.target.value)
              }
              className="w-full text-sm bg-muted rounded-lg p-3 focus:outline-none"
            />
          </FieldWrap>
        );
      })}

      <div className="flex gap-2 pt-1">
        <button
          disabled={saving}
          onClick={() => onSave(draft)}
          className="flex-1 py-3 rounded-xl bg-hero-gradient text-white text-sm font-bold shadow-elegant disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} className="px-5 py-3 rounded-xl bg-muted text-sm font-bold">
          Cancel
        </button>
      </div>
    </div>
  );
}

function FieldWrap({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</span>
      {children}
    </div>
  );
}
