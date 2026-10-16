import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Send, Pencil, Trash2, X, Check, Bell, BellOff, MessagesSquare, Mic, Square, Users, ArrowLeft, Lock,
} from "lucide-react";
import { MobileShell } from "@/components/mobile-shell";
import { supabase } from "@/integrations/supabase/client";
import {
  sendChatMessage, editChatMessage, deleteChatMessage, joinChat, listMembers, voiceUrls, listPrivate, listInbox,
} from "@/lib/chat.functions";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "Community Chat — New Generation Network" },
      { name: "description", content: "Encourage one another with messages and voice notes in the NGN community chat — no account needed." },
      { property: "og:title", content: "Community Chat — New Generation Network" },
      { property: "og:description", content: "Messages, voice notes and private chats to encourage one another's faith." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ChatPage,
});

type Msg = {
  id: string; name: string; body: string; edited_at: string | null; created_at: string;
  sender_id: string | null; audio_seconds: number | null; audio_url?: string | null; has_audio?: boolean;
};
type Peer = { id: string; name: string };

const TOKEN_KEY = "ngn-chat-token";
const MINE_KEY = "ngn-chat-mine";
const NAME_KEY = "ngn-chat-name";
const NOTIFY_KEY = "ngn-chat-notify";
const MAX_SECONDS = 180;

function getToken() {
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

const fmtSecs = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(",")[1] ?? "");
    r.onerror = rej;
    r.readAsDataURL(blob);
  });
}

function lastSeenLabel(iso: string) {
  const mins = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h} h ago`;
  return `${Math.round(h / 24)} d ago`;
}

function ChatPage() {
  const qc = useQueryClient();
  const send = useServerFn(sendChatMessage);
  const edit = useServerFn(editChatMessage);
  const del = useServerFn(deleteChatMessage);
  const join = useServerFn(joinChat);
  const getMembers = useServerFn(listMembers);
  const getVoice = useServerFn(voiceUrls);
  const getPrivate = useServerFn(listPrivate);
  const getInbox = useServerFn(listInbox);

  const [tab, setTab] = useState<"room" | "people">("room");
  const [peer, setPeer] = useState<Peer | null>(null);
  const [memberId, setMemberId] = useState<string | null>(null);
  const [online, setOnline] = useState<Record<string, string>>({});
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [text, setText] = useState("");
  const [mine, setMine] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [notify, setNotify] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recSecs, setRecSecs] = useState(0);
  const recRef = useRef<{ rec: MediaRecorder; chunks: Blob[]; stream: MediaStream; cancel: boolean; start: number } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seenRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const n = localStorage.getItem(NAME_KEY) ?? "";
    setName(n);
    setSavedName(n.trim());
    setMine(JSON.parse(localStorage.getItem(MINE_KEY) ?? "[]") as string[]);
    setNotify(localStorage.getItem(NOTIFY_KEY) === "1" && "Notification" in window && Notification.permission === "granted");
    join({ data: { token: getToken(), name: n || undefined } }).then((r) => setMemberId(r.memberId)).catch(() => {});
  }, [join]);

  // Live online presence
  useEffect(() => {
    if (!memberId) return;
    const channel = supabase.channel("ngn-chat-presence", { config: { presence: { key: memberId } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState<{ name: string }>();
        const next: Record<string, string> = {};
        for (const [k, v] of Object.entries(state)) next[k] = v[0]?.name ?? "Believer";
        setOnline(next);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") void channel.track({ name: localStorage.getItem(NAME_KEY) || "Believer" });
      });
    return () => { void supabase.removeChannel(channel); };
  }, [memberId]);

  const { data: messages = [] } = useQuery({
    queryKey: ["chat_messages"],
    enabled: !peer,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("id, name, body, edited_at, created_at, sender_id, audio_path, audio_seconds")
        .order("created_at", { ascending: false })
        .limit(150);
      if (error) throw error;
      return (data ?? []).reverse().map((m) => ({ ...m, has_audio: !!m.audio_path })) as Msg[];
    },
    refetchInterval: 5000,
    refetchIntervalInBackground: true,
    staleTime: 0,
  });

  const audioIds = useMemo(() => messages.filter((m) => m.has_audio).map((m) => m.id), [messages]);
  const { data: voice = {} } = useQuery({
    queryKey: ["chat_voice", audioIds.join(",")],
    enabled: audioIds.length > 0,
    queryFn: () => getVoice({ data: { ids: audioIds } }),
    staleTime: 1000 * 60 * 60,
  });

  const { data: privateMsgs = [] } = useQuery({
    queryKey: ["chat_private", peer?.id],
    enabled: !!peer,
    queryFn: () => getPrivate({ data: { token: getToken(), with: peer!.id } }) as Promise<Msg[]>,
    refetchInterval: 4000,
    staleTime: 0,
  });

  const { data: members = [] } = useQuery({
    queryKey: ["chat_members"],
    enabled: tab === "people",
    queryFn: () => getMembers(),
    refetchInterval: 30000,
  });

  const { data: inbox = [] } = useQuery({
    queryKey: ["chat_inbox"],
    queryFn: () => getInbox({ data: { token: getToken() } }),
    refetchInterval: 15000,
  });

  const shown: Msg[] = peer ? privateMsgs : messages.map((m) => ({ ...m, audio_url: voice[m.id] ?? null }));
  const isOwn = (m: Msg) => (!!memberId && m.sender_id === memberId) || mine.includes(m.id);

  // Alerts + autoscroll
  useEffect(() => {
    const ids = new Set(shown.map((m) => m.id));
    if (seenRef.current) {
      const fresh = shown.filter((m) => !seenRef.current!.has(m.id) && !isOwn(m));
      if (fresh.length) {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        if (notify && document.hidden) {
          const m = fresh[fresh.length - 1]!;
          new Notification(`${m.name} • NGN Chat`, { body: m.body ? m.body.slice(0, 120) : "🎤 Voice note", icon: "/pwa-192.png" });
        }
      }
    } else if (shown.length) {
      setTimeout(() => bottomRef.current?.scrollIntoView(), 50);
    }
    if (shown.length) seenRef.current = ids;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown.length, shown[shown.length - 1]?.id, notify]);

  useEffect(() => { seenRef.current = null; }, [peer?.id]);

  const saveMine = (next: string[]) => {
    setMine(next);
    localStorage.setItem(MINE_KEY, JSON.stringify(next.slice(-500)));
  };

  const refresh = () => qc.invalidateQueries({ queryKey: peer ? ["chat_private", peer.id] : ["chat_messages"] });

  const toggleNotify = async () => {
    if (!("Notification" in window)) return setError("Notifications are not supported on this device.");
    if (notify) { setNotify(false); localStorage.setItem(NOTIFY_KEY, "0"); return; }
    const p = await Notification.requestPermission();
    if (p === "granted") { setNotify(true); localStorage.setItem(NOTIFY_KEY, "1"); }
    else setError("Notifications were blocked in your phone settings.");
  };

  const saveName = () => {
    const n = name.trim();
    if (!n) return;
    localStorage.setItem(NAME_KEY, n);
    setSavedName(n);
    join({ data: { token: getToken(), name: n } }).catch(() => {});
  };

  const doSend = async (payload: { body?: string; audio?: string; audioType?: string; seconds?: number }) => {
    setBusy(true);
    setError("");
    try {
      if (name.trim()) { localStorage.setItem(NAME_KEY, name.trim()); setSavedName(name.trim()); }
      const { id } = await send({ data: { name: name.trim() || "Believer", token: getToken(), to: peer?.id ?? null, ...payload } });
      saveMine([...mine, id]);
      await refresh();
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      return true;
    } catch {
      setError("Could not send. Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  };

  const onSend = async () => {
    if (!text.trim() || busy) return;
    if (await doSend({ body: text.trim() })) setText("");
  };

  const startRecording = async () => {
    setError("");
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      return setError("Voice notes aren't supported on this device.");
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const type = ["audio/webm;codecs=opus", "audio/mp4", "audio/ogg"].find((t) => MediaRecorder.isTypeSupported(t));
      const rec = new MediaRecorder(stream, type ? { mimeType: type } : undefined);
      const state = { rec, chunks: [] as Blob[], stream, cancel: false, start: Date.now() };
      recRef.current = state;
      rec.ondataavailable = (e) => { if (e.data.size) state.chunks.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setRecording(false);
        const seconds = Math.round((Date.now() - state.start) / 1000);
        recRef.current = null;
        if (state.cancel || seconds < 1) return;
        const blob = new Blob(state.chunks, { type: rec.mimeType || "audio/webm" });
        await doSend({ audio: await blobToBase64(blob), audioType: blob.type, seconds, body: "" });
      };
      rec.start();
      setRecSecs(0);
      setRecording(true);
    } catch {
      setError("Please allow the microphone to record a voice note.");
    }
  };

  useEffect(() => {
    if (!recording) return;
    const t = setInterval(() => {
      const s = recRef.current ? Math.round((Date.now() - recRef.current.start) / 1000) : 0;
      setRecSecs(s);
      if (s >= MAX_SECONDS) recRef.current?.rec.stop();
    }, 250);
    return () => clearInterval(t);
  }, [recording]);

  const stopRecording = (cancel = false) => {
    if (!recRef.current) return;
    recRef.current.cancel = cancel;
    recRef.current.rec.stop();
  };

  const onSaveEdit = async (id: string) => {
    if (!editText.trim()) return;
    try {
      await edit({ data: { id, body: editText.trim(), token: getToken() } });
      setEditingId(null);
      await refresh();
    } catch { setError("Could not save your edit."); }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    try {
      await del({ data: { id, token: getToken() } });
      saveMine(mine.filter((m) => m !== id));
      await refresh();
    } catch { setError("Could not delete this message."); }
  };

  const onlineCount = Object.keys(online).length;
  const people = members.filter((m) => m.id !== memberId);
  const onlinePeople = people.filter((m) => online[m.id]);
  const offlinePeople = people.filter((m) => !online[m.id]);

  const openPeer = (p: Peer) => { setPeer(p); setTab("room"); };

  return (
    <MobileShell title="Community Chat">
      <div className="px-4 pt-4 pb-44 space-y-3">
        {peer ? (
          <div className="flex items-center gap-3 rounded-2xl glass border border-glass-border p-3">
            <button onClick={() => setPeer(null)} aria-label="Back to community" className="size-9 grid place-items-center rounded-full bg-muted">
              <ArrowLeft className="size-4" />
            </button>
            <Avatar name={peer.name} online={!!online[peer.id]} />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-sm truncate">{peer.name}</p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Lock className="size-3" /> Private chat • {online[peer.id] ? "online" : "offline"}
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 rounded-2xl glass border border-glass-border p-4">
              <MessagesSquare className="size-7 text-accent shrink-0" />
              <div className="flex-1">
                <p className="font-display font-bold text-sm">Encourage one another</p>
                <p className="text-[11px] text-muted-foreground">
                  <span className="inline-block size-1.5 rounded-full bg-emerald-500 mr-1 align-middle" />
                  {onlineCount} online now • moderated by the ministry
                </p>
              </div>
              <button
                onClick={() => void toggleNotify()}
                aria-label={notify ? "Turn off chat alerts" : "Turn on chat alerts"}
                className={`size-10 grid place-items-center rounded-full ${notify ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {notify ? <Bell className="size-4" /> : <BellOff className="size-4" />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 rounded-2xl bg-muted p-1">
              {(["room", "people"] as const).map((k) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`flex items-center justify-center gap-1.5 rounded-xl py-2 text-xs font-bold uppercase tracking-wider ${
                    tab === k ? "bg-primary text-primary-foreground shadow" : "text-muted-foreground"
                  }`}
                >
                  {k === "room" ? <MessagesSquare className="size-3.5" /> : <Users className="size-3.5" />}
                  {k === "room" ? "Community" : `People${inbox.length ? ` • ${inbox.length}` : ""}`}
                </button>
              ))}
            </div>
          </>
        )}

        {!peer && tab === "people" ? (
          <div className="space-y-5">
            {inbox.length > 0 && (
              <PeopleGroup title="Private messages">
                {inbox.map((p) => (
                  <PersonRow key={p.id} name={p.name} sub={`Last message ${lastSeenLabel(p.last)}`} online={!!online[p.id]} onClick={() => openPeer(p)} />
                ))}
              </PeopleGroup>
            )}
            <PeopleGroup title={`Online (${onlinePeople.length})`}>
              {onlinePeople.length === 0 && <p className="text-xs text-muted-foreground px-1">No one else is online right now.</p>}
              {onlinePeople.map((p) => (
                <PersonRow key={p.id} name={online[p.id] || p.name} sub="Online now" online onClick={() => openPeer({ id: p.id, name: online[p.id] || p.name })} />
              ))}
            </PeopleGroup>
            <PeopleGroup title="Offline">
              {offlinePeople.length === 0 && <p className="text-xs text-muted-foreground px-1">No other members yet.</p>}
              {offlinePeople.map((p) => (
                <PersonRow key={p.id} name={p.name} sub={`Seen ${lastSeenLabel(p.last_seen)}`} online={false} onClick={() => openPeer(p)} />
              ))}
            </PeopleGroup>
            <p className="text-[11px] text-center text-muted-foreground">Private chats are optional. Tap anyone to send them a message or voice note.</p>
          </div>
        ) : (
          <>
            {shown.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-10">
                {peer ? `Say hello to ${peer.name} 👋` : "Be the first to share an encouragement."}
              </p>
            )}
            {shown.map((m) => {
              const own = isOwn(m);
              return (
                <div key={m.id} className={`flex ${own ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 ${own ? "bg-primary text-primary-foreground rounded-br-md" : "bg-card border border-border rounded-bl-md"}`}>
                    {!own && !peer && (
                      <button
                        onClick={() => m.sender_id && m.sender_id !== memberId && openPeer({ id: m.sender_id, name: m.name })}
                        className="text-[11px] font-bold text-accent mb-0.5 flex items-center gap-1"
                      >
                        {m.sender_id && online[m.sender_id] && <span className="size-1.5 rounded-full bg-emerald-500" />}
                        {m.name}
                      </button>
                    )}
                    {(m.has_audio || m.audio_url) && (
                      m.audio_url ? (
                        <div className="flex items-center gap-2 min-w-[220px]">
                          <Mic className="size-4 shrink-0 opacity-80" />
                          <audio controls preload="metadata" src={m.audio_url} className="h-9 w-full" />
                        </div>
                      ) : (
                        <p className="text-xs opacity-70">🎤 Loading voice note…</p>
                      )
                    )}
                    {(m.has_audio || m.audio_url) && m.audio_seconds ? (
                      <p className="text-[10px] opacity-70 mt-0.5">Voice note • {fmtSecs(m.audio_seconds)}</p>
                    ) : null}
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
                    ) : m.body ? (
                      <p className="text-sm whitespace-pre-line break-words leading-relaxed">{m.body}</p>
                    ) : null}
                    <div className={`mt-1 flex items-center gap-2 text-[10px] ${own ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                      <span>
                        {new Date(m.created_at).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        {m.edited_at ? " • edited" : ""}
                      </span>
                      {own && editingId !== m.id && (
                        <span className="ml-auto flex gap-1">
                          {m.body && (
                            <button onClick={() => { setEditingId(m.id); setEditText(m.body); }} aria-label="Edit message" className="p-1"><Pencil className="size-3.5" /></button>
                          )}
                          <button onClick={() => void onDelete(m.id)} aria-label="Delete message" className="p-1"><Trash2 className="size-3.5" /></button>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {(peer || tab === "room") && (
        <div className="fixed bottom-[92px] left-1/2 z-40 w-full max-w-[440px] -translate-x-1/2 px-4">
          <div className="rounded-2xl border border-glass-border bg-popover/95 backdrop-blur-xl p-2.5 shadow-2xl space-y-2">
            {error && <p className="text-xs text-destructive px-1">{error}</p>}
            {savedName ? (
              <p className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
                <span>Posting as <b className="text-foreground">{savedName}</b></span>
                <button
                  onClick={() => {
                    if (window.confirm("Change the name people see on your messages?")) setSavedName("");
                  }}
                  className="underline opacity-60"
                >
                  change
                </button>
              </p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value.slice(0, 60))}
                  onKeyDown={(e) => { if (e.key === "Enter") saveName(); }}
                  onBlur={saveName}
                  placeholder="Your name (saved once)"
                  className="flex-1 text-xs bg-muted rounded-lg px-3 py-1.5 focus:outline-none"
                />
                <button onClick={saveName} className="rounded-lg bg-primary px-3 text-[11px] font-bold text-primary-foreground">Save</button>
              </div>
            )}
            {recording ? (
              <div className="flex items-center gap-2">
                <button onClick={() => stopRecording(true)} aria-label="Cancel voice note" className="size-11 grid place-items-center rounded-xl bg-muted text-muted-foreground">
                  <Trash2 className="size-4" />
                </button>
                <div className="flex-1 flex items-center gap-2 rounded-xl bg-destructive/10 px-3 py-2.5 text-sm">
                  <span className="size-2.5 rounded-full bg-destructive animate-pulse" />
                  <span className="font-bold tabular-nums">{fmtSecs(recSecs)}</span>
                  <span className="text-xs text-muted-foreground">Recording… tap send when done</span>
                </div>
                <button onClick={() => stopRecording(false)} aria-label="Send voice note" className="size-11 grid place-items-center rounded-xl bg-gold-gradient text-accent-foreground shadow-gold">
                  <Send className="size-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-end gap-2">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value.slice(0, 1000))}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void onSend(); } }}
                  rows={1}
                  placeholder={peer ? `Message ${peer.name}…` : "Write an encouragement…"}
                  className="flex-1 resize-none bg-muted rounded-xl px-3 py-2.5 text-sm focus:outline-none max-h-28"
                />
                {text.trim() ? (
                  <button onClick={() => void onSend()} disabled={busy} aria-label="Send" className="size-11 grid place-items-center rounded-xl bg-gold-gradient text-accent-foreground shadow-gold disabled:opacity-50">
                    <Send className="size-4" />
                  </button>
                ) : (
                  <button onClick={() => void startRecording()} disabled={busy} aria-label="Record voice note" className="size-11 grid place-items-center rounded-xl bg-primary text-primary-foreground shadow disabled:opacity-50">
                    {busy ? <Square className="size-4 animate-pulse" /> : <Mic className="size-4" />}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </MobileShell>
  );
}

function Avatar({ name, online }: { name: string; online: boolean }) {
  return (
    <div className="relative shrink-0">
      <div className="size-10 rounded-full bg-hero-gradient grid place-items-center font-display font-bold text-sm text-primary-foreground">
        {name.trim().charAt(0).toUpperCase() || "B"}
      </div>
      <span className={`absolute -bottom-0.5 -right-0.5 size-3 rounded-full border-2 border-background ${online ? "bg-emerald-500" : "bg-muted-foreground/50"}`} />
    </div>
  );
}

function PeopleGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <p className="text-[10px] uppercase tracking-widest text-primary font-bold px-1">{title}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function PersonRow({ name, sub, online, onClick }: { name: string; sub: string; online: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 rounded-2xl bg-card border border-border p-3 text-left hover:border-primary/40 transition">
      <Avatar name={name} online={online} />
      <div className="flex-1 min-w-0">
        <p className="font-bold text-sm truncate">{name}</p>
        <p className="text-[11px] text-muted-foreground">{sub}</p>
      </div>
      <MessagesSquare className="size-4 text-primary" />
    </button>
  );
}
