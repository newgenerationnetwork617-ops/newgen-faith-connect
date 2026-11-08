import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, Moon, Sun, MessageCircle, Mail, Youtube, Facebook, Instagram, ShieldCheck } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import logo from "@/assets/ngn-mark.png.asset.json";

const NAV = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/devotional", label: "Devotional" },
  { to: "/teachings", label: "Teachings" },
  { to: "/events", label: "Events" },
  { to: "/prayer", label: "Prayer" },
  { to: "/contact", label: "Contact" },
] as const;

interface SiteShellProps {
  children: ReactNode;
  title?: string;
  showTopBar?: boolean;
  hideNav?: boolean;
}

export function SiteShell({ children, showTopBar = true }: SiteShellProps) {
  const { theme, toggle } = useTheme();
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const isActive = (to: string) => (to === "/" ? pathname === "/" : pathname.startsWith(to));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {showTopBar && (
        <header className="sticky top-0 z-40 border-b border-glass-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-4 px-5">
            <Link to="/" className="flex min-w-0 items-center gap-3" onClick={() => setOpen(false)}>
              <div className="size-11 shrink-0 rounded-full bg-hero-gradient p-[2px] shadow-lg">
                <img
                  src={logo.url}
                  alt="New Generation Network logo"
                  className="size-full rounded-full bg-logo-surface object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-extrabold tracking-tight">New Generation Network</div>
                <div className="hidden text-[9px] font-bold uppercase tracking-[0.2em] text-primary sm:block">
                  Raising a righteous generation for Christ
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main">
              {NAV.map((n) => (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`rounded-full px-3.5 py-2 text-[13px] font-semibold transition ${
                    isActive(n.to)
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {n.label}
                </Link>
              ))}
            </nav>

            <div className="flex shrink-0 items-center gap-2">
              <Link
                to="/admin"
                aria-label="Admin dashboard"
                title="Admin dashboard"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-xs font-bold text-foreground transition hover:border-primary/40 hover:text-primary"
              >
                <ShieldCheck className="size-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
              <button
                onClick={toggle}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="grid size-10 place-items-center rounded-full bg-accent text-accent-foreground shadow-gold transition hover:scale-105"
              >
                {theme === "dark" ? <Sun className="size-[18px]" /> : <Moon className="size-[18px]" />}
              </button>
              <Link
                to="/get-app"
                className="hidden rounded-full bg-gold-gradient px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-accent-foreground shadow-gold transition hover:scale-[1.03] sm:block"
              >
                Get the App
              </Link>
              <button
                onClick={() => setOpen((v) => !v)}
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                className="glass grid size-10 place-items-center rounded-full text-foreground lg:hidden"
              >
                {open ? <X className="size-[18px]" /> : <Menu className="size-[18px]" />}
              </button>
            </div>
          </div>

          {open && (
            <nav className="border-t border-glass-border bg-background px-5 py-3 lg:hidden" aria-label="Mobile">
              <div className="mx-auto grid max-w-6xl gap-1">
                {NAV.map((n) => (
                  <Link
                    key={n.to}
                    to={n.to}
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${
                      isActive(n.to) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {n.label}
                  </Link>
                ))}
                <Link
                  to="/admin"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted"
                >
                  <ShieldCheck className="size-4 text-primary" /> Admin dashboard
                </Link>
                <Link
                  to="/get-app"
                  onClick={() => setOpen(false)}
                  className="mt-2 rounded-xl bg-gold-gradient px-4 py-3 text-center text-sm font-bold uppercase tracking-widest text-accent-foreground shadow-gold"
                >
                  Get the App
                </Link>
              </div>
            </nav>
          )}
        </header>
      )}

      <main className="mx-auto w-full max-w-3xl flex-1">{children}</main>

      <footer className="relative overflow-hidden bg-navy text-navy-foreground">
        <div className="absolute -left-16 -top-16 size-56 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-16 bottom-0 size-56 rounded-full bg-accent/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="flex items-center gap-3">
              <img src={logo.url} alt="NGN logo" className="size-12 rounded-full bg-logo-surface object-contain" />
              <div className="font-display text-lg font-bold leading-tight">
                New Generation
                <br />
                Network
              </div>
            </div>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/70">
              Raising a righteous generation for Christ — devotionals, teachings, books, events and prayer.
            </p>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Explore</p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-white/75">
              {NAV.map((n) => (
                <Link key={n.to} to={n.to} className="hover:text-white">
                  {n.label}
                </Link>
              ))}
              <Link to="/get-app" className="font-semibold text-accent hover:text-white">
                Get the App
              </Link>
              <Link to="/admin" className="font-semibold hover:text-white">
                Admin dashboard
              </Link>
            </div>
          </div>
          <div>
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-accent">Connect</p>
            <div className="flex gap-2">
              <SocialLink href="https://www.youtube.com/@NGNOfficialTV" label="YouTube">
                <Youtube className="size-4" />
              </SocialLink>
              <SocialLink href="mailto:newgenerationnetwork617@gmail.com" label="Email">
                <Mail className="size-4" />
              </SocialLink>
              <SocialLink href="https://wa.me/2349159942740" label="WhatsApp">
                <MessageCircle className="size-4" />
              </SocialLink>
              <SocialLink href={undefined} label="Facebook" hidden>
                <Facebook className="size-4" />
              </SocialLink>
              <SocialLink href={undefined} label="Instagram" hidden>
                <Instagram className="size-4" />
              </SocialLink>
            </div>
            <p className="mt-4 text-xs text-white/50">
              © {new Date().getFullYear()} New Generation Network. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SocialLink({
  href,
  label,
  hidden,
  children,
}: {
  href?: string;
  label: string;
  hidden?: boolean;
  children: ReactNode;
}) {
  if (hidden) return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-10 place-items-center rounded-full border border-white/15 bg-white/10 text-white transition hover:bg-white/20"
    >
      {children}
    </a>
  );
}
