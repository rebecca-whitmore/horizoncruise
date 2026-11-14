import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";
import { WidgetyHolidayResults } from "@/components/widgety-holiday-results";

export const metadata: Metadata = {
  title: "Widget search playground | Horizon Cruise",
  description: "Private prototype for a custom interface around Widgety search results.",
  robots: { index: false, follow: false },
};

export default function PlaygroundSearchPage() {
  return (
    <>
      <SiteHeader />
      <main className="page shell search-playground-page">
        <p className="eyebrow">Development sandbox</p>
        <h1 className="page-title">Holiday search prototype</h1>
        <p className="search-playground-intro">
          A Horizon Cruise filter experience paired with Widgety&apos;s hosted
          results, cruise details and enquiry journey.
        </p>
        <hr className="rule" />
        <WidgetyHolidayResults />
      </main>
    </>
  );
}
