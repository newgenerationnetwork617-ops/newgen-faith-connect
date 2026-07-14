import { Link, useRouterState } from "@tanstack/react-router";
import { Home, Play, BookOpen, HandHeart, Menu } from "lucide-react";

const items = [
  { to: "/", label: "Home", icon: Home },
  { to: "/watch", label: "Watch", icon: Play },
  { to: "/bible", label: "Bible", icon: BookOpen },
  { to: "/prayer", label: "Prayer", icon: HandHeart },
  { to: "/more", label: "More", icon: Menu },
] as const;

export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] z-50
                 bg-background/90 backdrop-blur-xl border-t border-border
                 px-4 pt-2 pb-[max(env(safe-area-inset-bottom),0.75rem)]
                 flex items-center justify-between"
    >
      {items.map(({ to, label, icon: Icon }) => {
        const active = to === "/" ? pathname === "/" : pathname.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 rounded-lg transition ${
              active ? "text-primary" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className={`size-5 transition ${active ? "scale-110" : ""}`} strokeWidth={active ? 2.4 : 1.8} />
            <span className="text-[10px] font-semibold uppercase tracking-wider">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
