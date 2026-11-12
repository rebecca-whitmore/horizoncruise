import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";

export const metadata: Metadata = {
  title: "Development playground | Horizon Cruise",
  robots: { index: false, follow: false },
};

/**
 * Permanent development sandbox for prototypes and API integration work.
 * Do not delete this route unless the project owner explicitly approves it.
 */
export default function PlaygroundPage() {
  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">Development sandbox</p>
        <h1 className="page-title">Playground</h1>
        <hr className="rule" />

        <section className="playground-stage" aria-label="Development test area">
          <p>Reserved for prototypes, API integrations and component testing.</p>
        </section>
      </main>
    </>
  );
}
