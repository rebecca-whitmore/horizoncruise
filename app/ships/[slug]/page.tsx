import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/layout";
import { WordPressShipTabs } from "@/components/wordpress-ship-tabs";
import {
  getShipBySlug,
  plainText,
  publicSiteUrl,
} from "@/lib/wordpress";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getShipBySlug(slug);

  if (result.status === "error" || !result.data) {
    return { robots: { index: false, follow: false } };
  }

  const ship = result.data;
  const title = plainText(ship.title.rendered);

  return {
    title: `${title} | Horizon Cruise`,
    description: ship.short_introduction
      ? plainText(ship.short_introduction)
      : undefined,
    alternates: {
      canonical: `${publicSiteUrl()}/ships/${encodeURIComponent(slug)}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function ShipPage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getShipBySlug(slug);

  if (result.status === "error") {
    return (
      <>
        <SiteHeader />
        <main className="page shell">
          <p className="notice">{result.message} Please try again shortly.</p>
        </main>
      </>
    );
  }

  if (!result.data) notFound();

  const ship = result.data;
  const sectionCandidates = [
    { id: "overview", label: "Overview", html: ship.full_overview },
    { id: "staterooms", label: "Staterooms", html: ship.staterooms },
    { id: "dining", label: "Dining", html: ship.dining },
    { id: "entertainment", label: "Entertainment", html: ship.entertainment },
    { id: "health-fitness", label: "Health & fitness", html: ship.health_fitness },
    { id: "younger-travellers", label: "Younger travellers", html: ship.younger_travellers },
    { id: "enrichment", label: "Enrichment", html: ship.enrichment },
  ];
  const sections = sectionCandidates.flatMap((section) =>
    section.html ? [{ ...section, html: section.html }] : [],
  );

  return (
    <>
      <SiteHeader />
      <main className="page shell ship-detail-page">
        <header className="article-header ship-detail-header">
          <p className="eyebrow">Cruise ship</p>
          <h1
            className="page-title"
            dangerouslySetInnerHTML={{ __html: ship.title.rendered }}
          />
          {ship.short_introduction ? (
            <p className="cruise-line-lead">
              {plainText(ship.short_introduction)}
            </p>
          ) : null}
        </header>
        <hr className="rule" />
        {sections.length ? (
          <WordPressShipTabs
            title={plainText(ship.title.rendered)}
            sections={sections}
          />
        ) : (
          <p className="notice">More information about this ship is coming soon.</p>
        )}
      </main>
    </>
  );
}
