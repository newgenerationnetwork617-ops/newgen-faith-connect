import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Send, Pencil, Trash2, X, Check, Bell, BellOff, MessagesSquare } from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { supabase } from "@/integrations/supabase/client";
import { sendChatMessage, editChatMessage, deleteChatMessage } from "@/lib/chat.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Community Chat — New Generation Network" },
      { name: "description", content: "Encourage one another in the NGN community chat — no account needed." },
      { property: "og:title", content: "Community Chat — New Generation Network" },
      { property: "og:description", content: "Encourage one another in the NGN community chat." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type Msg = { id: string; name: string; body: string; edited_at: string | null; created_at: string };

const TOKEN_KEY = "ngn-chat-token";
const MINE_KEY = "ngn-chat-mine";
const NAME_KEY = "ngn-chat-name";
const NOTIFY_KEY = "ngn-chat-notify";

function getToken() {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

function ChatPage() {
  const qc = useQueryClient();
  const send = useServerFn(sendChatMessage);
  const edit = useServerFn(editChatMessage);
  const del = useServerFn(deleteChatMessage);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [mine, setMine] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    setName(localStorage.getItem(NAME_KEY) ?? "");
    setMine(JSON.parse(localStorage.getItem(MINE_KEY) ?? "[]") as string[]);
    setNotify(localStorage.getItem(NOTIFY_KEY) === "1" && "Notification" in window && Notification.permission === "granted");
  }, []);

  const { data: messages = [] } = useQuery({
    queryKey: ["chat_messages"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, name, body, edited_at, created_at")
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      return ((data ?? []) as Msg[]).reverse();
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  // New-message alerts (while the app is open) + autoscroll.
  useEffect(() => {
    const ids = new Set(messages.map((m) => m.id));
    if (seenRef.current) {
      const fresh = messages.filter((m) => !seenRef.current!.has(m.id) && !mine.includes(m.id));
      if (fresh.length) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        if (notify && document.hidden) {
          const m = fresh[fresh.length - 1]!;
          new Notification(`${m.name} • NGN Chat`, { body: m.body.slice(0, 120), icon: "/pwa-192.png" });
        }
      }
    } else {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    }
    seenRef.current = ids;
  }, [messages, mine, notify]);

  const saveMine = (next: string[]) => {
    setMine(next);
    localStorage.setItem(MINE_KEY, JSON.stringify(next.slice(-500)));
  };

  const toggleNotify = async () => {
    if (!("Notification" in window)) return setError("Notifications are not supported on this device.");
    if (notify) {
      setNotify(false);
      localStorage.setItem(NOTIFY_KEY, "0");
      return;
    }
    const p = await Notification.requestPermission();
    if (p === "granted") {
      setNotify(true);
      localStorage.setItem(NOTIFY_KEY, "1");
    } else setError("Notifications were blocked in your phone settings.");
  };

  const onSend = async () => {
    if (!text.trim() || busy) return;
    setBusy(true);
    setError("");
    try {
      localStorage.setItem(NAME_KEY, name.trim());
      const { id } = await send({ data: { name: name.trim() || "Believer", body: text.trim(), token: getToken() } });
      saveMine([...mine, id]);
      setText("");
      await qc.invalidateQueries({ queryKey: ["chat_messages"] });
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    } catch {
      setError("Could not send. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const onSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await edit({ data: { id, body: editText.trim(), token: getToken() } });
      setEditingId(null);
      await qc.invalidateQueries({ queryKey: ["chat_messages"] });
    } catch {
      setError("Could not save your edit.");
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await del({ data: { id, token: getToken() } });
      saveMine(mine.filter((m) => m !== id));
      await qc.invalidateQueries({ queryKey: ["chat_messages"] });
    } catch {
      setError("Could not delete this message.");
    }
  };

  return (
    <MobileShell title="Community Chat">
      <div className="px-4 pt-4 pb-44 space-y-3">
        <div className="flex items-center gap-3 rounded-2xl glass border border-glass-border p-4">
          <MessagesSquare className="size-7 text-accent shrink-0" />
          <div className="flex-1">
            <p className="font-display font-bold text-sm">Encourage one another</p>
            <p className="text-[11px] text-muted-foreground">Be kind. Messages are moderated by the ministry.</p>
          </div>
          <button
            onClick={() => void toggleNotify()}
            aria-label={notify ? "Turn off chat alerts" : "Turn on chat alerts"}
            className={`size-10 grid place-items-center rounded-full ${notify ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {notify ? <Bell className="size-4" /> : <BellOff className="size-4" />}
          </button>
        </div>

        {messages.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-10">Be the first to share an encouragement.</p>
        )}

        {messages.map((m) => {
          const own = mine.includes(m.id);
          return (
            <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${
                  own ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"
                }`}
              >
                {!own && <p className="text-[11px] font-bold text-accent mb-0.5">{m.name}</p>}
                {editingId === m.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value.slice(0, 1000))}
                      rows={3}
                      autoFocus
                      className="w-full min-w-[200px] rounded-lg bg-background text-foreground p-2 text-sm focus:outline-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setEditingId(null)} aria-label="Cancel" className="size-8 grid place-items-center rounded-full bg-background/30"><X className="size-4" /></button>
                      <button onClick={() => void onSaveEdit(m.id)} aria-label="Save" className="size-8 grid place-items-center rounded-full bg-background text-foreground"><Check className="size-4" /></button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-line break-words leading-relaxed">{m.body}</p>
                )}
                <div className={`mt-1 flex items-center gap-2 text-[10px] ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  <span>
                    {new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    {m.edited_at ? " • edited" : ""}
                  </span>
                  {own && editingId !== m.id && (
                    <span className="ml-auto flex gap-1">
                      <button onClick={() => { setEditingId(m.id); setEditText(m.body); }} aria-label="Edit message" className="p-1"><Pencil className="size-3.5" /></button>
                      <button onClick={() => void onDelete(m.id)} aria-label="Delete message" className="p-1"><Trash2 className="size-3.5" /></button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-[92px] left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 px-4">
        <div className="rounded-2xl border border-glass-border bg-popover/95 backdrop-blur-xl p-2.5 shadow-2xl space-y-2">
          {error && <p className="text-xs text-destructive px-1">{error}</p>}
          <input
            value={name}
            onChange={(e) => setName(e.target.value.slice(0, 60))}
            placeholder="Your name"
            className="w-full text-xs bg-muted rounded-lg px-3 py-1.5 focus:outline-none"
          />
          <div className="flex items-end gap-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, 1000))}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void onSend(); } }}
              rows={1}
              placeholder="Write an encouragement…"
              className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none max-h-28"
            />
            <button
              onClick={() => void onSend()}
              disabled={busy || !text.trim()}
              aria-label="Send"
              className="size-11 grid place-items-center rounded-xl bg-gold-gradient text-accent-foreground shadow-gold disabled:opacity-50"
            >
              <Send className="size-4" />
            </button>
          </div>
        </div>
      </div>
    </MobileShell>
  );
}
