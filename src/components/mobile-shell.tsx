import type { ReactNode } from "react";
import { BottomNav } from "./bottom-nav";
import { Link } from "@tanstack/react-router";
import { Bell, User } from "lucide-react";

interface MobileShellProps {
  children: ReactNode;
  showTopBar?: boolean;
  title?: string;
  hideNav?: boolean;
}

export function MobileShell({ children, showTopBar = true, title, hideNav = false }: MobileShellProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[440px] min-h-screen relative pb-24">
        {showTopBar && (
          <header className="sticky top-0 z-40 bg-background/85 backdrop-blur-xl border-b border-border/60 px-5 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-hero-gradient flex items-center justify-center shadow-elegant">
                <span className="font-display font-bold text-white text-sm tracking-tighter">N</span>
              </div>
              <div className="leading-tight">
                <div className="font-display font-bold text-sm tracking-tight">
                  {title ?? "New Generation"}
                </div>
                {!title && (
                  <div className="text-[10px] text-muted-foreground tracking-widest uppercase">Network</div>
                )}
              </div>
            </Link>
            <div className="flex items-center gap-3">
              <button
                aria-label="Notifications"
                className="size-9 rounded-full grid place-items-center text-foreground/70 hover:bg-muted transition"
              >
                <Bell className="size-4" />
              </button>
              <Link
                to="/auth"
                aria-label="Profile"
                className="size-9 rounded-full bg-primary/10 border border-primary/15 grid place-items-center text-primary"
              >
                <User className="size-4" />
              </Link>
            </div>
          </header>
        )}
        <main className="flex-1">{children}</main>
        {!hideNav && <BottomNav />}
      </div>
    </div>
  );
}
