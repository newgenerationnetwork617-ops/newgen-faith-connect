import { useEffect, useState } from "react";
import logo from "@/assets/ngn-mark.png.asset.json";

const KEY = "ngn-splash-seen";

export function SplashScreen() {
  const [phase, setPhase] = useState<"hidden" | "show" | "leave">("hidden");

  useEffect(() => {
    if (sessionStorage.getItem(KEY)) return;
    sessionStorage.setItem(KEY, "1");
    setPhase("show");
    const a = setTimeout(() => setPhase("leave"), 2200);
    const b = setTimeout(() => setPhase("hidden"), 2800);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  if (phase === "hidden") return null;

  return (
    <div
      onClick={() => setPhase("hidden")}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-navy text-navy-foreground transition-opacity duration-500 ${
        phase === "leave" ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="pointer-events-none absolute -top-24 left-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-primary/30 blur-[110px]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 size-80 -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />

      <div className="relative animate-[ngn-rise_900ms_ease-out_both]">
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/25 [animation-duration:2.4s]" />
        <div className="relative size-40 rounded-full bg-hero-gradient p-[3px] shadow-gold">
          <img src={logo.url} alt="New Generation Network" className="size-full rounded-full bg-card object-contain" style={{ backgroundColor: "white" }} />
        </div>
      </div>

      <h1 className="relative mt-8 animate-[ngn-rise_900ms_200ms_ease-out_both] font-display text-3xl font-extrabold tracking-tight">
        New Generation Network
      </h1>
      <p className="relative mt-3 animate-[ngn-rise_900ms_400ms_ease-out_both] font-serif text-lg italic text-accent">
        Raising a righteous generation for Christ
      </p>
      <div className="relative mt-10 h-1 w-32 overflow-hidden rounded-full bg-white/15">
        <div className="h-full animate-[ngn-load_2.2s_ease-in-out_both] rounded-full bg-gold-gradient" />
      </div>
    </div>
  );
}
