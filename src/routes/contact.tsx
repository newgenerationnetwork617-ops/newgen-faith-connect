import { createFileRoute } from "@tanstack/react-router";
import { MobileShell } from "@/components/mobile-shell";
import { MessageCircle, Mail, Youtube, Facebook, Instagram, MapPin } from "lucide-react";
import { useContactInfo } from "@/lib/content";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — New Generation Network" },
      { name: "description", content: "Reach out for prayer, counselling, testimonies and enquiries." },
      { property: "og:title", content: "Contact Us — New Generation Network" },
      { property: "og:description", content: "Reach out for prayer, counselling, testimonies and enquiries." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const { contact } = useContactInfo();
  const numbers = contact.whatsapp_numbers ?? [];

  const waLink = (num: string) =>
    `https://wa.me/${num.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
      "Hello New Generation Network, I would like to connect.",
    )}`;

  return (
    <MobileShell title="Contact">
      <div className="px-5 py-6 space-y-6">
        <section className="rounded-2xl bg-navy text-navy-foreground p-6 relative overflow-hidden">
          <div className="absolute -right-10 -top-10 size-40 bg-primary/40 blur-3xl rounded-full" />
          <div className="relative">
            <MessageCircle className="size-8 text-accent mb-3" />
            <h1 className="font-display text-2xl font-bold leading-tight">We would love to hear from you.</h1>
            <p className="text-sm text-white/60 mt-2">
              Prayer, counselling, testimonies, partnership or enquiries — reach us any time.
            </p>
          </div>
        </section>

        <section className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">WhatsApp</p>
          {numbers.map((num) => (
            <a
              key={num}
              href={waLink(num)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border hover:border-primary/30 transition"
            >
              <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
                <MessageCircle className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-display font-bold text-sm">{num}</p>
                <p className="text-xs text-muted-foreground">Chat on WhatsApp</p>
              </div>
            </a>
          ))}
        </section>

        <section className="space-y-2.5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold px-1">Other channels</p>
          <ContactRow icon={Mail} label={contact.email} sub="Send us an email" href={`mailto:${contact.email}`} />
          <ContactRow icon={Youtube} label="NGN Official TV" sub="Watch on YouTube" href={contact.youtube} />
          {contact.facebook && <ContactRow icon={Facebook} label="Facebook" sub="Follow us" href={contact.facebook} />}
          {contact.instagram && <ContactRow icon={Instagram} label="Instagram" sub="Follow us" href={contact.instagram} />}
          {contact.address && <ContactRow icon={MapPin} label={contact.address} sub="Visit us" />}
        </section>
      </div>
    </MobileShell>
  );
}

function ContactRow({
  icon: Icon, label, sub, href,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
  href?: string;
}) {
  const inner = (
    <>
      <div className="size-10 rounded-xl bg-primary/10 text-primary grid place-items-center">
        <Icon className="size-5" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-display font-bold text-sm truncate">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </>
  );
  const className = "flex items-center gap-4 p-4 rounded-2xl bg-card border border-border";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${className} hover:border-primary/30 transition`}>
      {inner}
    </a>
  ) : (
    <div className={className}>{inner}</div>
  );
}
