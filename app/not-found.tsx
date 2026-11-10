import Link from "next/link";
import { SiteHeader } from "@/app/layout";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">404</p>
        <h1 className="page-title">Page not found</h1>
        <p><Link href="/articles">Browse articles</Link></p>
      </main>
    </>
  );
}
