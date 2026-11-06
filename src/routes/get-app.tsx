import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { SiteShell } from "@/components/site-shell";
import { Download, ShieldCheck, Smartphone } from "lucide-react";
import logo from "@/assets/ngn-mark.png.asset.json";
import { appFileUrl, formatBytes, formatDate, useLatestAppBuild } from "@/lib/content";

export const Route = createFileRoute("/get-app")({
  head: () => ({
    meta: [
      { title: "Download the NGN App — New Generation Network" },
      { name: "description", content: "Download the official New Generation Network Android app." },
      { property: "og:title", content: "Download the NGN App" },
      { property: "og:description", content: "Get the official New Generation Network Android app on your phone." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: GetAppPage,
});

function GetAppPage() {
  const { data: build, isLoading } = useLatestAppBuild();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    if (!build) return;
    setError("");
    setBusy(true);
    try {
      window.location.href = await appFileUrl(build.file_path);
    } catch {
      setError("The download couldn't start. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SiteShell>
      <section className="bg-sky-wash px-5 pb-12 pt-12 text-center">
        <img src={logo.url} alt="NGN logo" className="mx-auto size-24 rounded-full bg-logo-surface object-contain shadow-elegant" />
        <h1 className="mt-6 font-display text-4xl font-extrabold">Get the NGN app</h1>
        <p className="mx-auto mt-3 max-w-md text-[15px] text-muted-foreground">
          The New Generation Network app for Android phones.
        </p>

        <div className="mx-auto mt-8 max-w-sm rounded-[28px] border border-border bg-card p-6 text-left shadow-elegant">
          {isLoading ? (
            <p className="text-sm text-muted-foreground">Checking for the latest version…</p>
          ) : !build ? (
            <div className="text-center">
              <Smartphone className="mx-auto size-8 text-primary" />
              <p className="mt-3 font-display font-bold">Coming soon</p>
              <p className="mt-1 text-sm text-muted-foreground">The app download will appear here once it's ready.</p>
            </div>
          ) : (
            <>
              <p className="text-[10px] font-bold uppercase tracking-widest text-primary">Latest version</p>
              <p className="mt-1 font-display text-xl font-bold">{build.version_name}</p>
              <p className="text-xs text-muted-foreground">
                {[formatBytes(build.file_size), formatDate(build.created_at)].filter(Boolean).join(" • ")}
              </p>
              {build.notes && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{build.notes}</p>}
              <button onClick={download} disabled={busy} className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-hero-gradient py-3.5 text-sm font-bold text-primary-foreground shadow-elegant disabled:opacity-60">
                <Download className="size-4" /> {busy ? "Starting…" : "Download for Android"}
              </button>
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-xl space-y-4 px-5 pb-14">
        <h2 className="font-display text-xl font-bold">How to install</h2>
        {[
          "Tap “Download for Android” and wait for the file to finish.",
          "Open the downloaded file from your notifications or Downloads folder.",
          "If asked, allow installing apps from this source, then tap Install.",
        ].map((step, i) => (
          <div key={step} className="flex gap-4 rounded-2xl border border-border bg-card p-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-primary/10 font-display text-sm font-bold text-primary">{i + 1}</span>
            <p className="text-sm leading-relaxed">{step}</p>
          </div>
        ))}
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-primary" /> Official file published by the New Generation Network team.
        </p>
      </section>
    </SiteShell>
  );
}
