/**
 * Landing Header Component
 * Unified header for all landing pages (investor, startup, main website)
 */
import Link from "next/link";

export default function LandingHeader({ portalType = "main", showAuth = true }) {
  const portalColors = {
    investor: {
      gradient: "from-blue-600 to-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      subtitle: "Investor Portal"
    },
    startup: {
      gradient: "from-orange-500 to-orange-600",
      button: "bg-orange-600 hover:bg-orange-700",
      subtitle: "Startup Portal"
    },
    main: {
      gradient: "from-blue-600 to-blue-700",
      button: "bg-blue-600 hover:bg-blue-700",
      subtitle: null
    }
  };

  const config = portalColors[portalType] || portalColors.main;

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo/Brand */}
          <Link href="/" className="flex items-center gap-3">
            <div className={`rounded-xl bg-gradient-to-r ${config.gradient} px-3 py-1.5`}>
              <span className="text-sm font-bold text-white">VB</span>
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                VentureBridge
              </div>
              {config.subtitle && (
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {config.subtitle}
                </div>
              )}
            </div>
          </Link>

          {/* Right Side - Auth Buttons */}
          {showAuth && (
            <div className="flex items-center gap-3">
              <Link
                href="/signin"
                className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className={`rounded-lg ${config.button} px-4 py-2 text-sm font-medium text-white transition-colors`}
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
