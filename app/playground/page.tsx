import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";
import { WidgetySearch } from "@/components/widgety-search";
import { getWidgetyShips } from "@/lib/widgety";

export const metadata: Metadata = {
  title: "Development playground | Horizon Cruise",
  robots: { index: false, follow: false },
};

// This private test route checks Widgety at request time rather than at build time.
export const dynamic = "force-dynamic";

/**
 * Permanent development sandbox for prototypes and API integration work.
 * Do not delete this route unless the project owner explicitly approves it.
 */
export default async function PlaygroundPage() {
  const apiResult = await getWidgetyShips();

  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">Development sandbox</p>
        <h1 className="page-title">Playground</h1>
        <hr className="rule" />

        <section className="playground-intro" aria-labelledby="widget-heading">
          <p className="playground-label">Tool one · Hosted widget</p>
          <h2 id="widget-heading">Cruise &amp; Tour Search</h2>
          <p>
            This complete search experience is hosted and maintained by Widgety.
            We can place and frame it, while its internal interface remains under
            Widgety&apos;s control.
          </p>
        </section>

        <section className="widgety-shell" aria-label="Widgety cruise search">
          <WidgetySearch />
        </section>

        <section className="api-test" aria-labelledby="api-heading">
          <div>
            <p className="playground-label">Tool two · API</p>
            <h2 id="api-heading">Custom integration connection</h2>
            <p>
              The API gives us raw ship, operator, port and sailing data. It does
              not supply a finished interface; we will design that ourselves.
            </p>
          </div>

          <div className="api-status" aria-live="polite">
            <strong>
              {apiResult.ships.length > 0
                ? "API connected"
                : "API check needs attention"}
            </strong>
            <span>
              {apiResult.ships.length > 0
                ? "A permitted sample ship was returned successfully."
                : apiResult.message}
            </span>
          </div>
        </section>
      </main>
    </>
  );
}
