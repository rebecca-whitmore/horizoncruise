import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Horizon Cruise",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>
        {children}
      </body>
    </html>
  );
}

export function SiteHeader() {
  return (
    <header className="site-header shell">
      <Link className="wordmark" href="/">Horizon Cruise</Link>
      <nav className="site-nav" aria-label="Main navigation">
        <Link href="/articles">Articles</Link>
        <Link href="/about">About</Link>
        <Link href="/contact">Contact</Link>
      </nav>
    </header>
  );
}
