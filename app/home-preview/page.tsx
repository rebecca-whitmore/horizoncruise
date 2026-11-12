import type { Metadata } from "next";
import { Homepage } from "@/components/homepage/Homepage";

export const metadata: Metadata = {
  title: "Future homepage preview | Horizon Cruise",
  robots: { index: false, follow: false },
};

export default function HomePreviewPage() {
  return <Homepage />;
}
