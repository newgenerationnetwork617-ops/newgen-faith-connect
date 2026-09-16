import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { useState } from "react";
import { Mail, Lock, ArrowRight, User as UserIcon, LogOut, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth, signOut } from "@/hooks/use-auth";
import logo from "@/assets/ngn-mark.png.asset.json";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Team sign in — New Generation Network" },
      { name: "description", content: "Ministry team sign in for New Generation Network. The app itself is free for everyone, no account required." },
      { property: "og:title", content: "Team sign in — New Generation Network" },
      { property: "og:description", content: "Ministry team sign in. Everyone else can use the app freely without an account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { user, displayName, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: name.trim() || email.split("@")[0] },
          },
        });
        if (err) throw err;
        if (!data.session) {
          setNotice("Check your inbox to confirm your email, then sign in.");
          setMode("signin");
        } else {
          navigate({ to: "/" });
        }
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        navigate({ to: "/" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      setError("Google sign-in failed. Please try again.");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/" });
  }

  async function handleReset() {
    if (!email.trim()) {
      setError("Enter your email address first.");
      return;
    }
    setError(null);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setNotice(err ? null : "Password reset link sent to your email.");
    if (err) setError(err.message);
  }

  if (!loading && user) {
    return (
      <MobileShell title="Account">
        <div className="px-5 py-6 space-y-5">
          <section className="rounded-2xl bg-hero-gradient text-white p-7 shadow-elegant text-center">
            <img src={logo.url} alt="New Generation Network logo" className="size-20 mx-auto drop-shadow-lg" />
            <h1 className="font-display text-xl font-bold mt-3">Welcome, {displayName}</h1>
            <p className="text-xs text-white/75 mt-1">{user.email}</p>
          </section>

          <Link to="/more" className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <UserIcon className="size-4" />
            </div>
            <span className="flex-1 text-sm font-semibold">Settings & preferences</span>
          </Link>

          <Link to="/admin" className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border">
            <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
              <ShieldCheck className="size-4" />
            </div>
            <span className="flex-1 text-sm font-semibold">Admin dashboard</span>
          </Link>

          <button
            onClick={async () => {
              await signOut();
              navigate({ to: "/" });
            }}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-muted font-semibold text-sm"
          >
            <LogOut className="size-4" /> Sign out
          </button>
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell title="Welcome">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-hero-gradient text-white p-7 shadow-elegant relative overflow-hidden text-center">
          <div className="absolute -right-10 -top-10 size-40 bg-white/15 blur-3xl rounded-full" />
          <div className="relative">
            <img src={logo.url} alt="New Generation Network logo" className="size-24 mx-auto drop-shadow-lg" />
            <h1 className="font-display text-2xl font-bold leading-tight mt-3">Ministry team sign in</h1>
            <p className="text-sm text-white/75 mt-2">
              For pastors and admins who manage the app's content. Everyone else can use the whole app free — no account needed.
            </p>
          </div>
        </section>

        <div className="flex p-1 bg-muted rounded-full">
          {(["signin", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(null); setNotice(null); }}
              className={`flex-1 py-2.5 rounded-full text-sm font-semibold transition ${
                mode === m ? "bg-background shadow text-foreground" : "text-muted-foreground"
              }`}
            >
              {m === "signin" ? "Sign In" : "Sign Up"}
            </button>
          ))}
        </div>

        <form className="space-y-3" onSubmit={handleSubmit}>
          {mode === "signup" && (
            <div className="relative">
              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                placeholder="Your name"
                className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          )}
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={255}
              placeholder="Email address"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="password"
              required
              minLength={6}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-card border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>

          {mode === "signin" && (
            <button type="button" onClick={handleReset} className="text-xs font-semibold text-primary">
              Forgot password?
            </button>
          )}

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
          {notice && <p className="text-xs font-medium text-primary">{notice}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-hero-gradient text-white font-bold text-sm shadow-elegant hover:opacity-95 transition disabled:opacity-60"
          >
            {busy ? "Please wait…" : mode === "signin" ? "Sign In" : "Create Account"}
            <ArrowRight className="size-4" />
          </button>
        </form>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-card border border-border font-semibold text-sm hover:border-primary/30 transition disabled:opacity-60"
        >
          <GoogleIcon /> Continue with Google
        </button>

        <Link
          to="/"
          className="w-full block text-center py-3.5 rounded-xl bg-muted font-semibold text-sm text-muted-foreground hover:text-foreground transition"
        >
          Back to the app
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
