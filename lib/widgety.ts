/**
 * Server-only helpers for Widgety's API.
 *
 * Never move the APP ID or token into a NEXT_PUBLIC_ environment variable:
 * doing so would expose the credentials to every site visitor.
 */

type JsonRecord = Record<string, unknown>;

export type WidgetyShip = {
  title: string;
  slug: string;
  summary: string;
  imageUrl?: string;
  launched?: string;
  capacity?: number;
  crew?: number;
  decks?: number;
};

export type WidgetySailing = {
  reference: string;
  name: string;
  departureDate: string;
  returnDate: string;
  nights?: number;
  availability: string;
  startsAt?: string;
  endsAt?: string;
  regions: string[];
  imageUrl?: string;
  prices: {
    inside?: number;
    outside?: number;
    balcony?: number;
    suite?: number;
  };
};

export type WidgetyExplorerResult = {
  ship?: WidgetyShip;
  sailings: WidgetySailing[];
  totalSailings: number;
  message?: string;
};

function asRecord(value: unknown): JsonRecord | undefined {
  return typeof value === "object" && value !== null
    ? (value as JsonRecord)
    : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function plainText(value: unknown): string {
  return (asString(value) ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function getWidgetyConfig() {
  const baseUrl = process.env.WIDGETY_API_URL?.replace(/\/$/, "");
  const appId = process.env.WIDGETY_APP_ID;
  const token = process.env.WIDGETY_API_TOKEN;

  if (!baseUrl || !appId || !token) {
    throw new Error("Widgety API credentials are not configured.");
  }

  return { baseUrl, appId, token };
}

async function widgetyRequest(
  path: string,
  parameters: Record<string, string>,
): Promise<JsonRecord> {
  const { baseUrl, appId, token } = getWidgetyConfig();
  const url = new URL(`${baseUrl}/${path}`);

  Object.entries(parameters).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });
  url.searchParams.set("app_id", appId);
  url.searchParams.set("token", token);

  const response = await fetch(url, {
    // Do not put a credential-bearing request URL into Next's data cache.
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Widgety returned HTTP ${response.status}.`);
  }

  const payload: unknown = await response.json();
  const record = asRecord(payload);
  if (!record) throw new Error("Widgety returned an unexpected response.");
  return record;
}

function mapShip(payload: JsonRecord): WidgetyShip | undefined {
  const title = asString(payload.title);
  const slug = asString(payload.slug);
  if (!title || !slug) return undefined;

  const facts = asRecord(payload.ship_facts);
  return {
    title,
    slug,
    summary: plainText(payload.teaser) || plainText(payload.introduction),
    imageUrl: asString(payload.cover_image_href),
    launched: asString(facts?.launch_year),
    capacity: asNumber(facts?.capacity),
    crew: asNumber(facts?.crew_count),
    decks: asNumber(facts?.deck_count),
  };
}

function priceFrom(record: JsonRecord | undefined, key: string) {
  return asNumber(record?.[key]);
}

function mapSailing(value: unknown): WidgetySailing | undefined {
  const sailing = asRecord(value);
  if (!sailing) return undefined;

  const reference = asString(sailing.date_ref);
  const name = asString(sailing.name);
  const departureDate = asString(sailing.date_from);
  const returnDate = asString(sailing.date_to);
  if (!reference || !name || !departureDate || !returnDate) return undefined;

  const headlinePrices = asRecord(sailing.headline_prices);
  const cruise = asRecord(headlinePrices?.cruise);
  const double = asRecord(cruise?.double);
  const startsAt = asRecord(sailing.starts_at);
  const endsAt = asRecord(sailing.ends_at);

  return {
    reference,
    name,
    departureDate,
    returnDate,
    nights: asNumber(sailing.cruise_nights),
    availability: asString(sailing.availability_string) ?? "unknown",
    startsAt: asString(startsAt?.name),
    endsAt: asString(endsAt?.name),
    regions: stringList(sailing.regions),
    imageUrl: asString(sailing.image),
    prices: {
      inside: priceFrom(double, "from_inside"),
      outside: priceFrom(double, "from_outside"),
      balcony: priceFrom(double, "from_balcony"),
      suite: priceFrom(double, "from_suite"),
    },
  };
}

/**
 * Small API explorer for the development playground. It deliberately targets
 * one ship and a handful of UK departures while we learn the V3 data model.
 */
export async function getCelebrityEdgeExplorer(): Promise<WidgetyExplorerResult> {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [shipPayload, datesPayload] = await Promise.all([
      widgetyRequest("ships/celebrity-edge.json", {}),
      widgetyRequest("holidays/dates.json", {
        market: "uk",
        operators: "celebrity-cruises",
        ships: "celebrity-edge",
        availability: "available,limited,enquire",
        date_from: today,
        show_headlines: "true",
        limit: "10",
      }),
    ]);

    const dates = Array.isArray(datesPayload.dates) ? datesPayload.dates : [];
    const sailings = dates
      .map(mapSailing)
      .filter((sailing): sailing is WidgetySailing => Boolean(sailing))
      .sort(
        (a, b) =>
          new Date(a.departureDate).getTime() -
          new Date(b.departureDate).getTime(),
      )
      .slice(0, 3);

    return {
      ship: mapShip(shipPayload),
      sailings,
      totalSailings: asNumber(datesPayload.total) ?? sailings.length,
      message:
        sailings.length === 0
          ? "The API connected, but returned no matching Celebrity Edge departures."
          : undefined,
    };
  } catch {
    // Fetch errors can contain the complete credential-bearing request URL,
    // so deliberately do not write the error object to server logs.
    console.error("Could not load the Widgety API explorer.");
    return {
      sailings: [],
      totalSailings: 0,
      message: "The Widgety API could not be reached at the moment.",
    };
  }
}
