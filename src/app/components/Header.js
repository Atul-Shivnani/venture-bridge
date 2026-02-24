import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header({ links }) {
  return (
    <header className="site-header">
      <nav className="nav">
        <div className="logo">VentureBridge</div>
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href} className="pill" href={link.href}>
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
