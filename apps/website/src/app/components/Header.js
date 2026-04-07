import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Header({ links, variant = "default", centerLinks = [] }) {
  if (variant === "website") {
    return (
      <header className="sticky top-0 z-20 bg-bg/80 backdrop-blur-md after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-border after:to-transparent">
        <div className="mx-auto max-w-[1120px] px-5 py-3 sm:px-8">
          <nav className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 rounded-full border border-border bg-card/80 px-6 py-3 shadow-[0_8px_32px_rgba(24,20,18,0.08)] backdrop-blur-xl">
            {/* Logo */}
            <Link href="/" className="font-display text-lg font-semibold text-ink transition-opacity hover:opacity-75">
              VentureBridge
            </Link>

            {/* Center links */}
            <div className="flex items-center gap-0.5">
              {centerLinks.map((link) =>
                link.dropdown ? (
                  <div key={link.label} className="group relative">
                    <button
                      type="button"
                      className="relative flex items-center gap-1 px-4 py-1.5 text-sm text-ink-soft transition-colors hover:text-accent after:absolute after:inset-x-4 after:bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100"
                    >
                      {link.label}
                      <svg
                        className="h-3 w-3 transition-transform duration-200 group-hover:rotate-180"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="pointer-events-none absolute left-1/2 top-full mt-2 w-48 -translate-x-1/2 translate-y-1 rounded-2xl border border-border bg-card p-2 opacity-0 shadow-[0_20px_50px_rgba(24,20,18,0.12)] backdrop-blur-xl transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
                      {link.dropdown.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className="block rounded-xl px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-accent/8 hover:text-accent"
                        >
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="relative px-4 py-1.5 text-sm text-ink-soft transition-colors hover:text-accent after:absolute after:inset-x-4 after:bottom-0.5 after:h-[2px] after:origin-left after:scale-x-0 after:rounded-full after:bg-accent after:transition-transform after:duration-200 hover:after:scale-x-100"
                  >
                    {link.label}
                  </Link>
                )
              )}
            </div>

            {/* Right */}
            <div className="flex items-center justify-end gap-2">
              <Link
                href="/signin"
                className="rounded-full border border-border bg-bg/60 px-4 py-1.5 text-sm font-medium text-ink transition-all hover:border-ink/20 hover:shadow-sm"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-accent px-4 py-1.5 text-sm font-medium text-white shadow-[0_4px_12px_rgba(233,111,58,0.30)] transition-all hover:opacity-90 hover:shadow-[0_6px_18px_rgba(233,111,58,0.35)]"
              >
                Register
              </Link>
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-10 border-b border-border bg-bg/80 backdrop-blur-xl">
      <nav className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-semibold text-ink">
          VentureBridge
        </Link>
        <div className="flex items-center gap-3">
          {links?.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-border bg-card/60 px-4 py-1.5 text-sm text-ink-soft transition-all hover:text-ink hover:shadow-sm"
            >
              {link.label}
            </Link>
          ))}
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
