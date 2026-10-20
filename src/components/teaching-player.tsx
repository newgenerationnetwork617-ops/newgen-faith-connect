import { useState } from "react";
import { Play, ExternalLink } from "lucide-react";
import { Button } from "./ui/button";
import { youtubeEmbed, youtubeId, youtubeThumb, isFacebookVideo } from "@/lib/youtube";

export function TeachingPlayer({ source, thumbnail, title }: { source: string | null; thumbnail?: string | null; title: string }) {
  const [playing, setPlaying] = useState(false);
  const embed = youtubeEmbed(source, playing);
  const image = thumbnail || youtubeThumb(source);
  const id = youtubeId(source);
  const external = id ? `https://www.youtube.com/watch?v=${id}` : isFacebookVideo(source) && source ? (source.startsWith("http") ? source : `https://${source}`) : null;
  if (!embed) return null;
  return <div>
    <div className="aspect-video overflow-hidden bg-navy">
      {playing ? <iframe className="size-full" src={embed} title={title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen /> : <Button variant="ghost" aria-label={`Play ${title}`} onClick={() => setPlaying(true)} className="relative size-full rounded-none bg-night-gradient p-0 hover:bg-navy">
        {image && <img src={image} alt={title} loading="lazy" className="absolute inset-0 size-full object-cover" />}
        <span className="relative grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-elegant"><Play className="size-6" fill="currentColor" /></span>
      </Button>}
    </div>
    {external && <a href={external} target="_blank" rel="noreferrer" className="flex items-center justify-end gap-1 px-4 pt-2 text-[10px] font-semibold text-primary"><ExternalLink className="size-3" />{id ? "Open on YouTube" : "Open on Facebook"}</a>}
  </div>;
}