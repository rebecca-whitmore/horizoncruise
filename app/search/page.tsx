import type { Metadata } from "next";
import { WidgetySearch } from "@/components/widgety-search";

export const metadata: Metadata = {
  title: "Cruise search | Horizon Cruise",
  description: "Explore cruise holidays from Horizon Cruise.",
  robots: { index: false, follow: false },
};

export default function SearchPage() {
  return (
    <main className="cruise-search-page">
      <header className="cruise-search-hero">
        <div className="cruise-search-shell">
          <p className="eyebrow">Explore by land and sea</p>
          <h1>Find your cruise</h1>
          <p>
            Search cruise holidays and discover the journeys currently available
            through our connected cruise partners.
          </p>
        </div>
      </header>

      <div className="cruise-search-shell">
        <section className="search-widget-shell" aria-label="Search cruise holidays">
          <WidgetySearch />
        </section>
      </div>
    </main>
  );
}
