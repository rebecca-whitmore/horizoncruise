import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";

export const metadata: Metadata = {
  title: "Playground | Horizon Cruise",
  robots: { index: false, follow: false },
};

export default function PlaygroundPage() {
  return (
    <>
      <SiteHeader />
      <main className="page shell">
        <p className="eyebrow">Temporary test page</p>
        <h1 className="page-title">Playground</h1>
        <hr className="rule" />

        <section className="playground-stage" aria-label="Widget tests">
          <div className="widget-test">
            <header className="playground-heading">
              <p className="eyebrow">Embedded cruise search</p>
              <h2>Holiday results widget</h2>
            </header>

            <div className="ship-widget-frame">
              <iframe
                src="https://www.widgety.co.uk/widgets/bLPiyBSxxqSSDtJCahPx/holidays/result.widget?operator_ids%5B%5D=12"
                title="Interactive cruise holiday results"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="fullscreen"
              >
                <a href="https://www.widgety.co.uk/widgets/bLPiyBSxxqSSDtJCahPx/holidays/result.widget?operator_ids%5B%5D=12">
                  Open the cruise holiday results
                </a>
              </iframe>
            </div>
          </div>

          <div className="widget-test">
            <header className="playground-heading">
              <p className="eyebrow">Embedded ship guide</p>
              <h2>Carnival Celebration widget</h2>
            </header>

            <div className="ship-widget-frame">
              <iframe
                src="https://www.widgety.co.uk/widgets/bLPiyBSxxqSSDtJCahPx/ships/carnival-celebration.widget?operator_ids%5B%5D=85&amp;ship_ids%5B%5D=1297"
                title="Interactive Carnival Celebration ship information"
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="fullscreen"
              >
                <a href="https://www.widgety.co.uk/widgets/bLPiyBSxxqSSDtJCahPx/ships/carnival-celebration.widget?operator_ids%5B%5D=85&amp;ship_ids%5B%5D=1297">
                  Open the Carnival Celebration ship information
                </a>
              </iframe>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
