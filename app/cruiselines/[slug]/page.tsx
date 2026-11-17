import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/app/layout";
import {
  getCruiseLineBySlug,
  plainText,
  publicSiteUrl,
} from "@/lib/wordpress";

export const revalidate = 60;

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCruiseLineBySlug(slug);

  if (result.status === "error" || !result.data) {
    return { robots: { index: false, follow: false } };
  }

  const line = result.data;
  const title = plainText(line.title.rendered);
  const description = line.short_introduction
    ? plainText(line.short_introduction)
    : undefined;

  return {
    title: `${title} | Horizon Cruise`,
    description,
    alternates: {
      canonical: `${publicSiteUrl()}/cruiselines/${encodeURIComponent(slug)}`,
    },
    robots: { index: false, follow: false },
  };
}

export default async function CruiseLinePage({ params }: PageProps) {
  const { slug } = await params;
  const result = await getCruiseLineBySlug(slug);

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

  const line = result.data;

  return (
    <>
      <SiteHeader />
      <main className="page shell cruise-line-page">
        <header className="article-header">
          <p className="eyebrow">Cruise line</p>
          <h1
            className="page-title"
            dangerouslySetInnerHTML={{ __html: line.title.rendered }}
          />
          {line.short_introduction && (
            <p className="cruise-line-lead">{plainText(line.short_introduction)}</p>
          )}
        </header>
        <hr className="rule" />
        {line.full_overview ? (
          <article
            className="article-body cruise-line-overview"
            dangerouslySetInnerHTML={{ __html: line.full_overview }}
          />
        ) : (
          <p className="notice">More information about this cruise line is coming soon.</p>
        )}
      </main>
    </>
  );
}
