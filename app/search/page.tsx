import type { Metadata } from "next";
import CruiseSearch from "@/components/cruise-search";
import { getCruiseSearchOptions, searchCruises } from "@/lib/widgety-search";

export const metadata: Metadata = {
  title: "Cruise search | Horizon Cruise",
  description: "Explore cruise holidays from Horizon Cruise.",
  robots: { index: false, follow: false },
};

export default async function SearchPage() {
  let options;
  let initial;
  try {
    [options, initial] = await Promise.all([
      getCruiseSearchOptions(),
      searchCruises({ sort: "date", page: 1, perPage: 25 }),
    ]);
  } catch {
    console.error("Could not prepare the cruise search page.");
  }
  if (options && initial) return <CruiseSearch options={options} initial={initial} />;
  return <main className="cruise-search-page"><div className="cruise-search-shell"><p className="notice">The live cruise search is temporarily unavailable. Please try again shortly.</p></div></main>;
}
