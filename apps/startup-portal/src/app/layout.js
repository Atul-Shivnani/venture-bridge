import "./globals.css";

export const metadata = {
  title: "Startup Portal | VentureBridge",
  description: "Startup portal application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
