import type { Metadata } from "next";
import Image from "next/image";
import { SiteHeader } from "@/app/layout";
import { WidgetySearch } from "@/components/widgety-search";
import {
  getCelebrityEdgeExplorer,
  type WidgetySailing,
} from "@/lib/widgety";

export const metadata: Metadata = {
  title: "Development playground | Horizon Cruise",
  robots: { index: false, follow: false },
};

// This private test route checks Widgety at request time rather than at build time.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const priceFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 2,
});

function formatDate(value: string) {
  return dateFormatter.format(new Date(value));
}

function SailingPrices({ sailing }: { sailing: WidgetySailing }) {
  const prices = [
    ["Inside", sailing.prices.inside],
    ["Ocean view", sailing.prices.outside],
    ["Balcony", sailing.prices.balcony],
    ["Suite", sailing.prices.suite],
  ] as const;

  return (
    <dl className="sailing-prices">
      {prices.map(([label, price]) =>
        price !== undefined ? (
          <div key={label}>
            <dt>{label}</dt>
            <dd>From {priceFormatter.format(price)}</dd>
          </div>
        ) : null,
      )}
    </dl>
  );
}

/**
 * Permanent development sandbox for prototypes and API integration work.
 * Do not delete this route unless the project owner explicitly approves it.
 */
export default async function PlaygroundPage() {
  const explorer = await getCelebrityEdgeExplorer();

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
            This complete search experience is hosted and maintained by Widgety.
            We can place and frame it, while its internal interface remains under
            Widgety&apos;s control.
          </p>
        </section>

        <section className="widgety-shell" aria-label="Widgety cruise search">
          <WidgetySearch />
        </section>

        <section className="api-test" aria-labelledby="api-heading">
          <div className="api-test-heading">
            <p className="playground-label">Tool two &middot; Custom API</p>
            <h2 id="api-heading">Custom integration connection</h2>
            <p>
              The API gives us raw ship, operator, port and sailing data. It does
              not supply a finished interface; everything below is rendered by
              Horizon Cruise code from the V3 data.
            </p>
          </div>

          <div className="api-status" aria-live="polite">
            <strong>
              {explorer.ship && explorer.sailings.length > 0
                ? "API connected"
                : "API check needs attention"}
            </strong>
            <span>
              {explorer.ship && explorer.sailings.length > 0
                ? `${explorer.totalSailings} matching Celebrity Edge departures are currently available to this UK trial key.`
                : explorer.message}
            </span>
          </div>

          {explorer.ship ? (
            <article className="ship-snapshot">
              {explorer.ship.imageUrl ? (
                <Image
                  className="ship-snapshot-image"
                  src={explorer.ship.imageUrl}
                  alt={`${explorer.ship.title} at sea`}
                  width={1600}
                  height={900}
                  sizes="(max-width: 760px) 100vw, 50vw"
                />
              ) : (
                <div className="ship-image-fallback" aria-hidden="true" />
              )}
              <div className="ship-snapshot-copy">
                <p className="playground-label">Ship profile response</p>
                <h3>{explorer.ship.title}</h3>
                <p>{explorer.ship.summary}</p>
                <dl className="ship-facts">
                  {explorer.ship.launched ? (
                    <div><dt>Launched</dt><dd>{explorer.ship.launched}</dd></div>
                  ) : null}
                  {explorer.ship.capacity ? (
                    <div><dt>Guests</dt><dd>{explorer.ship.capacity.toLocaleString("en-GB")}</dd></div>
                  ) : null}
                  {explorer.ship.crew ? (
                    <div><dt>Crew</dt><dd>{explorer.ship.crew.toLocaleString("en-GB")}</dd></div>
                  ) : null}
                  {explorer.ship.decks ? (
                    <div><dt>Decks</dt><dd>{explorer.ship.decks}</dd></div>
                  ) : null}
                </dl>
              </div>
            </article>
          ) : null}

          {explorer.sailings.length > 0 ? (
            <div className="sailing-section">
              <div className="sailing-section-heading">
                <div>
                  <p className="playground-label">Cruise &amp; Tours V3 dates</p>
                  <h3>Celebrity Edge sample sailings</h3>
                </div>
                <p>Showing 3 of {explorer.totalSailings} matching departures.</p>
              </div>

              <div className="sailing-grid">
                {explorer.sailings.map((sailing) => (
                  <article className="sailing-card" key={sailing.reference}>
                    {sailing.imageUrl ? (
                      <Image
                        className="sailing-image"
                        src={sailing.imageUrl}
                        alt=""
                        width={800}
                        height={500}
                        sizes="(max-width: 760px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="sailing-image-fallback" aria-hidden="true" />
                    )}
                    <div className="sailing-copy">
                      <p className="sailing-meta">
                        {sailing.nights ? `${sailing.nights} nights · ` : ""}
                        {sailing.availability}
                      </p>
                      <h4>{sailing.name}</h4>
                      <p>
                        {formatDate(sailing.departureDate)}–{formatDate(sailing.returnDate)}
                      </p>
                      {sailing.startsAt ? (
                        <p>
                          {sailing.startsAt}
                          {sailing.endsAt && sailing.endsAt !== sailing.startsAt
                            ? ` to ${sailing.endsAt}`
                            : " round trip"}
                        </p>
                      ) : null}
                      <SailingPrices sailing={sailing} />
                      <small>Reference: {sailing.reference}</small>
                    </div>
                  </article>
                ))}
              </div>
              <p className="api-caveat">
                Development data only. Prices are headline API values and will
                need full qualification, availability checks and enquiry terms
                before appearing on a public page.
              </p>
            </div>
          ) : null}
        </section>
      </main>
    </>
  );
}
