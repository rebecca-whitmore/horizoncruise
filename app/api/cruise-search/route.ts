import { NextRequest, NextResponse } from "next/server";
import { searchCruises } from "@/lib/widgety-search";

const list = (value: string | null) => value?.split(",").map((item) => item.trim()).filter(Boolean) ?? [];

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams;
  try {
    return NextResponse.json(await searchCruises({
      months: list(query.get("months")),
      duration: query.get("duration") ?? undefined,
      types: list(query.get("types")),
      destinations: list(query.get("destinations")),
      operator: query.get("operator") ?? undefined,
      ship: query.get("ship") ?? undefined,
      adultsOnly: query.get("adultsOnly") === "true",
      sort: query.get("sort") ?? "date",
      page: Number(query.get("page") || 1),
      perPage: Number(query.get("perPage") || 30),
    }));
  } catch {
    console.error("Could not load Widgety cruise search results.");
    return NextResponse.json({ results: [], total: 0, page: 1, perPage: 30, message: "Cruise results are temporarily unavailable. Please try again shortly." }, { status: 502 });
  }
}
