import type { Metadata } from "next";
import Link from "next/link";
import { isPublicSiteIndexable, publicSiteUrl } from "@/lib/wordpress";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicSiteUrl()),
  title: "Horizon Cruise",
  robots: isPublicSiteIndexable()
    ? { index: true, follow: true }
    : { index: false, follow: false },
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
