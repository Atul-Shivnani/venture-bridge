import Link from "next/link";

export default function Footer({ note }) {
  return (
    <footer id="contact" className="mt-16 border-t border-border py-10">
      <div className="grid gap-8 sm:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold text-ink">VentureBridge</p>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">
            Direct capital access for Indian startups with investor-grade validation.
          </p>
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Portals</span>
          <Link href="/investors" className="text-sm text-ink-soft hover:text-ink transition-colors">Investor</Link>
          <Link href="/startups" className="text-sm text-ink-soft hover:text-ink transition-colors">Startup</Link>
          <Link href="/admin" className="text-sm text-ink-soft hover:text-ink transition-colors">Admin</Link>
        </div>
        <div className="grid gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">Contact</span>
          <a href="mailto:hello@venturebridge.in" className="text-sm text-ink-soft hover:text-ink transition-colors">hello@venturebridge.in</a>
          <a href="tel:+919999988888" className="text-sm text-ink-soft hover:text-ink transition-colors">+91 99999 88888</a>
        </div>
      </div>
      <p className="mt-8 text-xs text-ink-soft">
        {note ?? "Prototype showcase. Success-fee commissions apply only after closed deals."}
      </p>
    </footer>
  );
}
