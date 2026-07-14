import { createFileRoute, Link } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { useState } from "react";
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — New Generation Network" },
      { name: "description", content: "Sign in or create an account to sync your journey." },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  return (
    <MobileShell title="Welcome">
      <div className="px-5 py-6 space-y-6">
        {/* Hero */}
        <section className="rounded-2xl bg-hero-gradient text-white p-7 shadow-elegant relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-white/15 blur-3xl rounded-full" />
          <div className="relative">
            <Sparkles className="size-8 text-accent mb-3" />
            <h1 className="font-display text-2xl font-bold leading-tight">Welcome to New Generation</h1>
            <p className="text-sm text-white/70 mt-2">Sign in to sync your Bible, prayers, favorites, and devotionals across devices.</p>
          </div>
        </section>

        {/* Toggle */}
        <div className="flex p-1 bg-muted rounded-full">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Form */}
        <form className="space-y-3" onSubmit={(e) => e.preventDefault()}>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {mode === "signin" && (
            <button type="button" className="text-xs font-semibold text-primary">Forgot password?</button>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hero-gradient text-white font-bold text-sm shadow-elegant hover:opacity-95 transition"
          >
            {mode === "signin" ? "Sign In" : "Create Account"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-card border border-border font-semibold text-sm hover:border-primary/30 transition">
          <GoogleIcon /> Continue with Google
        </button>

        <Link
          to="/"
          className="w-full block text-center py-3.5 rounded-xl bg-muted font-semibold text-sm text-muted-foreground hover:text-foreground transition"
        >
          Continue as Guest
        </Link>

        <p className="text-center text-[11px] text-muted-foreground">
          By continuing you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </MobileShell>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
      <path fill="#4285F4" d="M22.5 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.32z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.99.66-2.25 1.06-3.71 1.06-2.86 0-5.29-1.93-6.15-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.85 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.67-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06L5.85 9.9C6.71 7.3 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
