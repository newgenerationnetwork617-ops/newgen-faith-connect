/** Extract an 11-char YouTube video ID from any link format (watch, youtu.be, shorts, live, embed) or a raw ID. */
export function youtubeId(input?: string | null): string | null {
  if (!input) return null;
  const s = input.trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/youtube(?:-nocookie)?\.com\/(?:embed|shorts|live|v)\/([\w-]{11})/);
  return m ? m[1] : null;
}

export function youtubeEmbed(input?: string | null, autoplay = false): string | null {
  const id = youtubeId(input);
  if (!id) return null;
  return `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1${autoplay ? "&autoplay=1" : ""}`;
}

export function youtubeThumb(input?: string | null): string | null {
  const id = youtubeId(input);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}
