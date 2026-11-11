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

        <section className="playground-stage" aria-labelledby="ship-widget-heading">
          <header className="playground-heading">
            <p className="eyebrow">Embedded ship guide</p>
            <h2 id="ship-widget-heading">Ship widget test</h2>
          </header>

          <div className="ship-widget-frame">
            <iframe
              src="https://www.widgety.co.uk/widgets/-AKyevjXorNGxJE2o4DF.widget"
              title="Interactive ship information"
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allow="fullscreen"
            >
              <a href="https://www.widgety.co.uk/widgets/-AKyevjXorNGxJE2o4DF.widget">
                Open the interactive ship information
              </a>
            </iframe>
          </div>
        </section>
      </main>
    </>
  );
}
