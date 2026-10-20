import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart, MessageCircle, Share2, Send, ChevronDown } from "lucide-react";
import { Button } from "./ui/button";
import { supabase } from "@/integrations/supabase/client";
import { addTeachingComment, getMyTeachingLike, setTeachingLike } from "@/lib/teaching-engagement.functions";

function deviceToken() {
  let token = localStorage.getItem("ngn-chat-token");
  if (!token || !/^[a-f0-9]{48}$/.test(token)) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");
    localStorage.setItem("ngn-chat-token", token);
  }
  return token;
}

export function TeachingEngagement({ teachingId, title }: { teachingId: string; title: string }) {
  const [token, setToken] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [limit, setLimit] = useState(20);
  const [name, setName] = useState("");
  const [savedName, setSavedName] = useState("");
  const [body, setBody] = useState("");
  const [notice, setNotice] = useState("");
  const getLike = useServerFn(getMyTeachingLike);
  const saveLike = useServerFn(setTeachingLike);
  const postComment = useServerFn(addTeachingComment);
  const qc = useQueryClient();
  const key = ["teaching_engagement", teachingId];

  useEffect(() => {
    try {
      setToken(deviceToken());
      const stored = localStorage.getItem("ngn-chat-name") ?? "";
      setName(stored); setSavedName(stored);
    } catch { setNotice("Enable browser storage to save your reactions."); }
  }, []);

  const stats = useQuery({
    queryKey: [...key, "stats"],
    queryFn: async () => {
      const [likes, comments] = await Promise.all([
        supabase.rpc("teaching_like_count", { _teaching_id: teachingId }),
        supabase.from("teaching_comments").select("id", { count: "exact", head: true }).eq("teaching_id", teachingId),
      ]);
      if (likes.error || comments.error) throw new Error("Could not load reactions");
      return { likes: Number(likes.data ?? 0), comments: comments.count ?? 0 };
    },
  });
  const ownLike = useQuery({ queryKey: [...key, "mine", token], enabled: !!token, queryFn: () => getLike({ data: { teachingId, token } }) });
  const comments = useQuery({
    queryKey: [...key, "comments", limit], enabled: expanded,
    queryFn: async () => {
      const { data, error } = await supabase.from("teaching_comments").select("id,name,body,created_at").eq("teaching_id", teachingId).order("created_at", { ascending: false }).limit(limit);
      if (error) throw new Error("Could not load comments");
      return data ?? [];
    },
  });
  const reaction = useMutation({
    mutationFn: () => saveLike({ data: { teachingId, token, liked: !ownLike.data?.liked } }),
    onSuccess: (data) => { qc.setQueryData([...key, "mine", token], data); void qc.invalidateQueries({ queryKey: [...key, "stats"] }); },
    onError: () => setNotice("Could not save your like. Please try again."),
  });
  const comment = useMutation({
    mutationFn: () => postComment({ data: { teachingId, token, name: name.trim(), body: body.trim() } }),
    onSuccess: () => {
      setBody(""); setSavedName(name.trim());
      try { localStorage.setItem("ngn-chat-name", name.trim()); } catch { /* storage unavailable */ }
      setNotice(""); void qc.invalidateQueries({ queryKey: key });
    },
    onError: () => setNotice("Could not post your comment. Check your connection and try again shortly."),
  });
  const share = async () => {
    const url = `${window.location.origin}/teachings?teaching=${encodeURIComponent(teachingId)}`;
    try {
      if (navigator.share) await navigator.share({ title, text: `${title} — New Generation Network`, url });
      else { await navigator.clipboard.writeText(url); setNotice("Teaching link copied."); }
    } catch (error) {
      if (!(error instanceof DOMException && error.name === "AbortError")) setNotice("Sharing is unavailable. Please try again.");
    }
  };

  return <div className="border-t border-border pt-3 text-card-foreground">
    <div className="flex items-center justify-between gap-1">
      <Button variant="ghost" size="sm" aria-label={ownLike.data?.liked ? "Unlike teaching" : "Like teaching"} aria-pressed={ownLike.data?.liked ?? false} disabled={!token || reaction.isPending || ownLike.isLoading || ownLike.isError} onClick={() => reaction.mutate()} className={ownLike.data?.liked ? "text-accent" : "text-muted-foreground"}><Heart fill={ownLike.data?.liked ? "currentColor" : "none"} />{stats.data?.likes ?? 0}</Button>
      <Button variant="ghost" size="sm" aria-expanded={expanded} aria-label="Comments" onClick={() => setExpanded(!expanded)}><MessageCircle />{stats.data?.comments ?? 0}<span className="text-xs">Comments</span></Button>
      <Button variant="ghost" size="sm" aria-label="Share teaching" onClick={share}><Share2 /><span className="text-xs">Share</span></Button>
    </div>
    {notice && <p role="status" className="mt-2 text-xs text-muted-foreground">{notice}</p>}
    {expanded && <div className="mt-4 space-y-4">
      <form onSubmit={(e) => { e.preventDefault(); comment.mutate(); }} className="space-y-2">
        {savedName ? <p className="text-xs text-muted-foreground">Commenting as <span className="font-semibold text-foreground">{savedName}</span></p> : <input aria-label="Your name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} required maxLength={60} className="w-full rounded-lg border border-input bg-muted p-3 text-sm" />}
        <div className="flex items-end gap-2"><textarea aria-label="Your comment" placeholder="Share your reflection…" required maxLength={1000} rows={2} value={body} onChange={(e) => setBody(e.target.value)} className="min-w-0 flex-1 resize-y rounded-lg border border-input bg-muted p-3 text-sm" /><Button aria-label="Post comment" size="icon" type="submit" disabled={!token || !name.trim() || !body.trim() || comment.isPending}><Send /></Button></div>
      </form>
      {comments.isLoading && <p className="text-xs text-muted-foreground">Loading comments…</p>}
      {comments.isError && <p className="text-xs text-destructive">Could not load comments. <Button variant="link" size="sm" onClick={() => comments.refetch()}>Retry</Button></p>}
      {comments.data?.length === 0 && <p className="text-xs text-muted-foreground">No comments yet.</p>}
      {comments.data?.map((item) => <div key={item.id} className="border-t border-border pt-3"><div className="flex flex-wrap items-center justify-between gap-1"><p className="text-xs font-bold">{item.name}</p><time className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</time></div><p className="mt-1 whitespace-pre-wrap break-words text-sm leading-relaxed">{item.body}</p></div>)}
      {(comments.data?.length ?? 0) < (stats.data?.comments ?? 0) && <Button variant="ghost" size="sm" onClick={() => setLimit(limit + 20)}><ChevronDown />More comments</Button>}
    </div>}
  </div>;
}