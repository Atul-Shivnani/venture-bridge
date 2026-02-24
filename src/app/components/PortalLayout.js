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
    <div className="page">
      <div className="grain" />
      <div className="container">
        <Header links={navLinks} />

        <section className="portal-hero">
          <div className="portal-header">
            <div>
              <span className="tag">{tag}</span>
              <h1 className="section-title">{title}</h1>
              <p className="muted">{description}</p>
            </div>
            <button className="cta-primary">{cta}</button>
          </div>
          {heroVisual}
        </section>

        {children}

        <Footer note={footerNote} />
      </div>
    </div>
  );
}
