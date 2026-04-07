import { Space_Grotesk, Fraunces } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
});

export const metadata = {
  title: "VentureBridge | Direct Capital For Indian Startups",
  description:
    "A showcase prototype connecting Indian startups with global investors, bank loans, and government schemes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
             __html: "try { let stored = window.localStorage.getItem('vb-theme'); if (stored === 'light' || stored === 'dark') { document.documentElement.setAttribute('data-theme', stored); } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) { document.documentElement.setAttribute('data-theme', 'dark'); } else { document.documentElement.setAttribute('data-theme', 'light'); } } catch (_) {}"
          }}
        />
      </head>
      <body className={`${spaceGrotesk.variable} ${fraunces.variable} bg-bg text-ink antialiased selection:bg-accent/20 selection:text-accent`}>
        {children}
      </body>
    </html>
  );
}
