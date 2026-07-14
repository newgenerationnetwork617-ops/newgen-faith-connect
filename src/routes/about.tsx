import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { Heart, Sparkles, Shield, BookOpen, HandHeart, Users } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About Us — New Generation Network" },
      { name: "description", content: "Our mission, vision, and core values." },
    ],
  }),
  component: AboutPage,
});

const values = [
  { icon: BookOpen, label: "Faith" },
  { icon: Heart, label: "Love" },
  { icon: Sparkles, label: "Holiness" },
  { icon: Shield, label: "Truth" },
  { icon: HandHeart, label: "Service" },
  { icon: Users, label: "Discipleship" },
];

function AboutPage() {
  return (
    <MobileShell title="About Us">
      <div className="px-5 py-6 space-y-8">
        <section className="rounded-2xl overflow-hidden bg-hero-gradient text-white p-7 shadow-elegant relative">
          <div className="absolute -right-10 -top-10 size-52 bg-white/15 rounded-full blur-3xl" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/80 font-bold">Our Vision</p>
            <h1 className="font-display text-3xl font-bold leading-tight mt-2 text-balance">
              We are a people raised to raise a righteous generation for Christ.
            </h1>
          </div>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-2">Mission</p>
          <p className="text-[15px] leading-relaxed text-foreground/90">
            To spread the Gospel of Jesus Christ, inspire lives, strengthen faith, and bring hope to people
            around the world through impactful Christian content.
          </p>
        </section>

        <section>
          <p className="text-[10px] uppercase tracking-widest text-primary font-bold mb-3">Core Values</p>
          <div className="grid grid-cols-3 gap-2">
            {values.map((v) => (
              <div key={v.label} className="rounded-xl bg-card border border-border p-4 flex flex-col items-center gap-2 text-center">
                <div className="size-9 rounded-lg bg-primary/10 text-primary grid place-items-center">
                  <v.icon className="size-4" />
                </div>
                <span className="font-display font-bold text-xs">{v.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl bg-navy text-navy-foreground p-6 relative overflow-hidden">
          <div className="absolute -right-8 bottom-0 size-40 bg-accent/30 blur-3xl rounded-full" />
          <div className="relative">
            <p className="text-[10px] uppercase tracking-widest text-accent font-bold mb-2">Scripture</p>
            <p className="font-serif italic text-lg leading-snug">
              "Train up a child in the way he should go, and when he is old he will not depart from it."
            </p>
            <p className="text-xs text-white/60 mt-3">Proverbs 22:6</p>
          </div>
        </section>
      </div>
    </MobileShell>
  );
}
