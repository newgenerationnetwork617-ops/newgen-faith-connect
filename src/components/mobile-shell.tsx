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
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[440px] min-h-screen relative pb-24">
        {showTopBar && (
          <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60 px-5 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src={logo.url}
                alt="New Generation Network logo"
                className="size-9 rounded-full shadow-elegant object-contain"
              />

              <div className="leading-tight">
                <div className="font-display font-bold text-sm tracking-tight">
                  {title ?? "New Generation"}
                </div>
                {!title && (
                  <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Network</div>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/search"
                aria-label="Search"
                className="size-9 rounded-full grid place-items-center text-foreground/70 hover:bg-muted transition"
              >
                <Search className="size-4" />
              </Link>
              <button
                onClick={toggle}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="size-9 rounded-full bg-primary/10 border border-primary/15 grid place-items-center text-primary hover:bg-primary/15 transition"
              >
                {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
              </button>
            </div>
          </header>
        )}
        <main className="flex-1">{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
