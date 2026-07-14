import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { contactInfo } from "@/lib/mock-data";
import { MessageCircle, Phone, Mail, Globe, Facebook, Instagram, Youtube } from "lucide-react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — New Generation Network" },
      { name: "description", content: "Reach out for prayer, counselling, testimonies, and enquiries." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const waNumber = contactInfo.whatsapp.replace(/[^0-9]/g, "");
  const waLink = (text: string) =>
    `https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`;

  return (
    <MobileShell title="Contact">
      <div className="px-5 py-6 space-y-6">
        {/* WhatsApp CTA */}
        <section className="rounded-2xl overflow-hidden bg-navy text-navy-foreground p-6 relative shadow-elegant">
          <div className="absolute -right-8 -top-8 size-40 bg-primary/40 blur-3xl rounded-full" />
          <div className="relative">
            <MessageCircle className="size-8 text-accent mb-3" />
            <h1 className="font-display text-2xl font-bold leading-tight">Talk to the ministry directly</h1>
            <p className="text-sm text-white/60 mt-2">Start a WhatsApp conversation for prayer, counselling, testimonies, or general questions.</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { l: "Prayer Request", t: "Hello NGN, I'd like to share a prayer request." },
                { l: "Counselling", t: "Hello NGN, I would like counselling." },
                { l: "Testimony", t: "Hello NGN, I want to share my testimony." },
                { l: "General", t: "Hello NGN, I have a question." },
              ].map((o) => (
                <a
                  key={o.l}
                  href={waLink(o.t)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-center transition"
                >
                  {o.l}
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* Direct */}
        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">Direct</p>
          <Row icon={Phone} label="Phone" value={contactInfo.phone} href={`tel:${contactInfo.phone}`} />
          <Row icon={Mail} label="Email" value={contactInfo.email} href={`mailto:${contactInfo.email}`} />
          <Row icon={Globe} label="Website" value={contactInfo.website.replace("https://", "")} href={contactInfo.website} />
        </section>

        <section className="space-y-2">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">Social</p>
          <Row icon={Facebook} label="Facebook" value="@newgenerationnetwork" href={contactInfo.facebook} />
          <Row icon={Instagram} label="Instagram" value="@newgenerationnetwork" href={contactInfo.instagram} />
          <Row icon={Youtube} label="YouTube" value="@newgenerationnetwork" href={contactInfo.youtube} />
        </section>
      </div>
    </MobileShell>
  );
}

function Row({ icon: Icon, label, value, href }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/30 transition"
    >
      <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{label}</p>
        <p className="text-sm font-semibold truncate">{value}</p>
      </div>
    </a>
  );
}
