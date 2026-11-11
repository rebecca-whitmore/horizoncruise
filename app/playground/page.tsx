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

        <section className="playground-stage" aria-label="Design test area">
          <p>Use this space to test layouts, components and visual ideas.</p>
        </section>
      </main>
    </>
  );
}
