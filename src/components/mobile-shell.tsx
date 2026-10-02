import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { Link } from "@tanstack/react-router";
import { Moon, Sun, Search } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/ngn-mark.png.asset.json";

interface MobileShellProps {
  children: ReactNode;
  showTopBar?: boolean;
  title?: string;
  hideNav?: boolean;
}

export function MobileShell({ children, showTopBar = true, title, hideNav = false }: MobileShellProps) {
  const { theme, toggle } = useTheme();

  return (
    <div className="min-h-screen bg-navy text-foreground">
      <div className="relative mx-auto min-h-screen max-w-[440px] overflow-x-clip bg-background pb-32 shadow-2xl">
        {/* Ambient celestial glows */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-72 rounded-full bg-primary/20 blur-[80px]" />
        <div className="pointer-events-none absolute -right-20 top-[40%] size-64 rounded-full bg-accent/10 blur-[100px]" />

        {showTopBar && (
          <header className="sticky top-0 z-40 flex items-center justify-between bg-background/80 px-6 pb-4 pt-6 backdrop-blur-xl">
            <Link to="/" className="flex items-center gap-3">
              <div className="size-11 rounded-full bg-hero-gradient p-[2px] shadow-lg">
                <img
                  src={logo.url}
                  alt="New Generation Network logo"
                  className="size-full rounded-full bg-card object-contain"
                  style={{ backgroundColor: "white" }}
                />
              </div>
              <div className="leading-tight">
                <div className="font-display text-xl font-bold tracking-tight">{title ?? "NGN"}</div>
                {!title && (
                  <div className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary">New Generation Network</div>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <Link
                to="/search"
                aria-label="Search"
                className="glass grid size-10 place-items-center rounded-full text-foreground"
              >
                <Search className="size-[18px]" />
              </Link>
              <button
                onClick={toggle}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-gold"
              >
                {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </button>
            </div>
          </header>
        )}
        <main className="relative z-10 flex-1">{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
