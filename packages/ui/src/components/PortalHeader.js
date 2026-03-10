/**
 * Portal Header Component
 * Modern, rounded header with portal-specific navigation and dark mode support
 */
import Link from "next/link";

export default function PortalHeader({ portalName, navLinks = [], user }) {
  const handleSignOut = () => {
    // Clear token and redirect
    document.cookie = "vb_token=; path=/; max-age=0";
    window.location.href = process.env.NEXT_PUBLIC_WEBSITE_URL || "http://localhost:3000";
  };

  const portalColors = {
    investor: "from-blue-600 to-blue-700",
    startup: "from-orange-500 to-orange-600",
    admin: "from-purple-600 to-purple-700",
  };

  const gradient = portalColors[portalName] || "from-blue-600 to-blue-700";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <div className="flex items-center gap-3">
            <div className={`rounded-xl bg-gradient-to-r ${gradient} px-3 py-1.5`}>
              <span className="text-sm font-bold text-white">VB</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                VentureBridge
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {portalName} Portal
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Side - User Menu */}
          <div className="flex items-center gap-3">
            {user && (
              <div className="hidden sm:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">
                  {user.email}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user.role || "User"}
                </div>
              </div>
            )}
            <button
              onClick={handleSignOut}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
