export default function Footer({ note }) {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <div className="logo">VentureBridge</div>
          <p className="muted">
            Direct capital access for Indian startups with investor-grade
            validation.
          </p>
        </div>
        <div className="footer-links">
          <span className="muted">Portals</span>
          <a href="/investors">Investor</a>
          <a href="/startups">Startup</a>
          <a href="/admin">Admin</a>
        </div>
        <div className="footer-links">
          <span className="muted">Contact</span>
          <a href="#">hello@venturebridge.in</a>
          <a href="#">+91 99999 88888</a>
        </div>
      </div>
      <p className="footer-note">
        {note ??
          "Prototype showcase. Success-fee commissions apply only after closed deals."}
      </p>
    </footer>
  );
}
