import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";
import { CruiseLineContent } from "@/components/cruise-line-content";
import { WidgetySearch } from "@/components/widgety-search";
import {
  getCelebrityCruisesContent,
  getSilverseaCruisesContent,
} from "@/lib/widgety";

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
  const [celebrityResult, silverseaResult] = await Promise.all([
    getCelebrityCruisesContent(),
    getSilverseaCruisesContent(),
  ]);

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
              <h2 id="api-heading">Celebrity Cruises profile</h2>
            </div>
            <p>
              Cruise-line content supplied by Widgety, presented through a custom
              interface that we can refine without the widget&apos;s layout restrictions.
            </p>
          </div>

          {celebrityResult.cruiseLine ? (
            <CruiseLineContent cruiseLine={celebrityResult.cruiseLine} />
          ) : (
            <div className="notice" role="status">
              {celebrityResult.message ?? "The cruise-line content is temporarily unavailable."}
            </div>
          )}

          <div className="api-profile-separator">
            <div>
              <p className="playground-label">Tool two &middot; Custom API</p>
              <h2>Silversea profile</h2>
            </div>
            <p>
              A second cruise-line profile using the same flexible presentation
              and Silversea&apos;s own operator-level content from Widgety.
            </p>
          </div>

          {silverseaResult.cruiseLine ? (
            <CruiseLineContent cruiseLine={silverseaResult.cruiseLine} />
          ) : (
            <div className="notice" role="status">
              {silverseaResult.message ?? "The Silversea content is temporarily unavailable."}
            </div>
          )}
        </section>
      </main>
    </>
  );
}
