import "./globals.css";

export const metadata = {
  title: "Admin Portal | VentureBridge",
  description: "Admin portal application.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
