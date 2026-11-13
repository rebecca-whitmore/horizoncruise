import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";
import { ShipContentTabs } from "@/components/ship-content-tabs";
import { WidgetySearch } from "@/components/widgety-search";
import { getCelebrityEdgeContent } from "@/lib/widgety";

export const metadata: Metadata = {
  title: "Development playground | Horizon Cruise",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

/**
 * Permanent development sandbox for prototypes and API integration work.
 * Do not delete this route unless the project owner explicitly approves it.
 */
export default async function PlaygroundPage() {
  const result = await getCelebrityEdgeContent();

  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">Development sandbox</p>
        <h1 className="page-title">Playground</h1>
        <hr className="rule" />

        <section className="playground-intro" aria-labelledby="widget-heading">
          <p className="playground-label">Tool one &middot; Hosted widget</p>
          <h2 id="widget-heading">Cruise &amp; Tour Search</h2>
          <p>
            Widgety&apos;s complete hosted search remains here as a visual and
            functional comparison while we develop our own experience below.
          </p>
        </section>

        <section className="widgety-shell" aria-label="Widgety cruise search">
          <WidgetySearch />
        </section>

        <section className="api-prototype" aria-labelledby="api-heading">
          <div className="api-prototype-heading">
            <div>
              <p className="playground-label">Tool two &middot; Custom API</p>
              <h2 id="api-heading">Horizon Cruise ship experience</h2>
            </div>
            <p>
              Real Celebrity Edge content supplied by Widgety, presented through
              a custom interface that we can refine without the widget&apos;s layout
              restrictions.
            </p>
          </div>

          {result.ship ? (
            <ShipContentTabs ship={result.ship} />
          ) : (
            <div className="notice" role="status">
              {result.message ?? "The ship content is temporarily unavailable."}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
