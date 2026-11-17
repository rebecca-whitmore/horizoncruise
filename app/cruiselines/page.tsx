import type { Metadata } from "next";
import { SiteHeader } from "@/app/layout";

export const metadata: Metadata = {
  title: "Cruise Lines | Horizon Cruise",
  robots: { index: false, follow: false },
};

export default function CruiseLinesPage() {
  return (
    <>
      <SiteHeader />
      <main className="page shell" aria-label="Cruise lines" />
    </>
  );
}
