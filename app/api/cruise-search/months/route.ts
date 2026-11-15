import { NextRequest, NextResponse } from "next/server";
import { getAvailableCruiseMonths } from "@/lib/widgety-search";

export async function GET(request: NextRequest) {
  const year = Number(request.nextUrl.searchParams.get("year"));
  try {
    return NextResponse.json({ months: await getAvailableCruiseMonths(year) });
  } catch {
    console.error("Could not load Widgety sailing months.");
    return NextResponse.json({ months: [] }, { status: 502 });
  }
}
