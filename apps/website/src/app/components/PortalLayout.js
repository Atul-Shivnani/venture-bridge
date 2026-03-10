import Footer from "./Footer";
import Header from "./Header";

export default function PortalLayout({
  children,
  navLinks,
  tag,
  title,
  description,
  cta,
  heroVisual,
  footerNote,
}) {
  return (
    <div className="min-h-screen bg-bg">
      <Header variant="website" centerLinks={navLinks} />
      <div className="mx-auto max-w-[1120px] px-5 sm:px-8">
        <section className="py-14 pb-8">
          <div className="flex flex-wrap items-center justify-between gap-5 sm:flex-nowrap">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-accent-2/15 px-4 py-1.5 text-sm font-semibold text-accent-2">
                {tag}
              </span>
              <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                {title}
              </h1>
              <p className="mt-2 max-w-xl text-base text-ink-soft">{description}</p>
            </div>
            <button className="rounded-xl bg-accent px-6 py-3 font-semibold text-white shadow-[0_8px_24px_rgba(233,111,58,0.25)] transition-all hover:opacity-90">
              {cta}
            </button>
          </div>
          {heroVisual && <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card">{heroVisual}</div>}
        </section>

        {children}

        <Footer note={footerNote} />
      </div>
    </div>
  );
}
