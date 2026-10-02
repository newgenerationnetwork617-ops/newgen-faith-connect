import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Play, BookOpen, HandHeart, Menu } from "lucide-react";

const side = [
  [
    { to: "/", label: "Home", icon: Home },
    { to: "/bible", label: "Bible", icon: BookOpen },
  ],
  [
    { to: "/watch", label: "Watch", icon: Play },
    { to: "/more", label: "More", icon: Menu },
  ],
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));
  const prayerActive = isActive("/prayer");

  const renderItem = ({ to, label, icon: Icon }: (typeof side)[number][number]) => {
    const active = isActive(to);
    return (
      <Link
        key={to}
        to={to}
        className={`flex flex-1 flex-col items-center gap-1 py-1 transition ${
          active ? "text-primary" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Icon className="size-[22px]" strokeWidth={active ? 2.4 : 1.9} />
        <span className="text-[9px] font-bold uppercase tracking-widest">{label}</span>
      </Link>
    );
  };

  return (
    <div className="fixed bottom-0 left-1/2 z-50 w-full max-w-[440px] -translate-x-1/2 px-5 pb-[max(env(safe-area-inset-bottom),1rem)]">
      <nav className="flex border border-glass-border bg-popover/90 backdrop-blur-2xl h-[68px] items-center justify-around rounded-[28px] px-2 shadow-2xl">
        {side[0].map(renderItem)}
        <div className="flex flex-1 justify-center">
          <Link
            to="/prayer"
            aria-label="Prayer"
            className={`-mt-10 grid size-16 place-items-center rounded-full border-4 border-background bg-gold-gradient text-accent-foreground shadow-gold transition hover:scale-105 ${
              prayerActive ? "ring-2 ring-accent/60" : ""
            }`}
          >
            <HandHeart className="size-7" strokeWidth={2.3} />
          </Link>
        </div>
        {side[1].map(renderItem)}
      </nav>
    </div>
  );
}
