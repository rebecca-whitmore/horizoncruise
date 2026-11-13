import { unstable_cache } from "next/cache";

/**
 * Server-only helpers for Widgety's API. Credentials must never use a
 * NEXT_PUBLIC_ variable because that would expose them to every visitor.
 */

type JsonRecord = Record<string, unknown>;

export type ShipContentItem = {
  name: string;
  description: string;
  imageUrl?: string;
  meta?: string;
};

export type ShipDeck = {
  name: string;
  description: string;
  imageUrl?: string;
};

export type ShipContentSection = {
  intro: string;
  items: ShipContentItem[];
  totalItems: number;
};

export type WidgetyShipContent = {
  title: string;
  summary: string;
  overview: string;
  imageUrl?: string;
  facts: Array<{ label: string; value: string }>;
  staterooms: ShipContentSection;
  decks: ShipDeck[];
  dining: ShipContentSection;
  entertainment: ShipContentSection;
  healthAndFitness: ShipContentSection;
  enrichment: ShipContentSection;
  usefulToKnow: ShipContentItem[];
};

export type WidgetyShipContentResult = {
  ship?: WidgetyShipContent;
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

function plainText(value: unknown): string {
  return (asString(value) ?? "")
    .replace(/<br\s*\/?\s*>/gi, " ")
    .replace(/<\/p>/gi, " ")
    .replace(/<\/li>/gi, "; ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(?:39|x27);/gi, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function concise(value: unknown, maximum = 420): string {
  const text = plainText(value);
  if (text.length <= maximum) return text;
  const shortened = text.slice(0, maximum);
  const sentenceEnd = Math.max(
    shortened.lastIndexOf(". "),
    shortened.lastIndexOf("; "),
  );
  return `${shortened.slice(0, sentenceEnd > maximum * 0.55 ? sentenceEnd + 1 : maximum).trim()}…`;
}

function firstImage(value: unknown): string | undefined {
  if (!Array.isArray(value)) return undefined;
  const image = asRecord(value[0]);
  return asString(image?.href);
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

async function widgetyRequest(path: string): Promise<JsonRecord> {
  const { baseUrl, appId, token } = getWidgetyConfig();
  const url = new URL(`${baseUrl}/${path}`);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("token", token);

  const response = await fetch(url, {
    // The safe cache below stores only our mapped result, not this secret URL.
    cache: "no-store",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) throw new Error(`Widgety returned HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  const record = asRecord(payload);
  if (!record) throw new Error("Widgety returned an unexpected response.");
  return record;
}

function mapItems(value: unknown, maximum: number): ShipContentItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry): ShipContentItem | undefined => {
      const item = asRecord(entry);
      const name = asString(item?.name);
      if (!item || !name) return undefined;

      const types = Array.isArray(item.types)
        ? item.types.filter((type): type is string => typeof type === "string")
        : [];
      const experience = asString(item.experience);
      const food = asString(item.food);

      return {
        name,
        description: concise(item.description),
        imageUrl: firstImage(item.images) ?? firstImage(item.floorplans),
        meta: [experience, food, ...types].filter(Boolean).join(" · ") || undefined,
      };
    })
    .filter((item): item is ShipContentItem => Boolean(item))
    .slice(0, maximum);
}

function mapSection(
  payload: JsonRecord,
  introField: string,
  itemsField: string,
  maximum: number,
): ShipContentSection {
  const intro = asRecord(payload[introField]);
  const sourceItems = Array.isArray(payload[itemsField]) ? payload[itemsField] : [];
  return {
    intro: concise(intro?.intro, 900),
    items: mapItems(sourceItems, maximum),
    totalItems: sourceItems.length,
  };
}

function mapDecks(value: unknown): ShipDeck[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry): ShipDeck | undefined => {
      const deck = asRecord(entry);
      const name = asString(deck?.name);
      if (!deck || !name) return undefined;
      return {
        name,
        description: concise(deck.description, 800),
        imageUrl: firstImage(deck.images),
      };
    })
    .filter((deck): deck is ShipDeck => Boolean(deck));
}

function practicalItem(name: string, value: unknown): ShipContentItem | undefined {
  const description = concise(value, 650);
  return description ? { name, description } : undefined;
}

function mapShip(payload: JsonRecord): WidgetyShipContent | undefined {
  const title = asString(payload.title);
  if (!title) return undefined;

  const facts = asRecord(payload.ship_facts);
  const factValues: Array<[string, string | number | undefined]> = [
    ["Launched", asString(facts?.launch_year)],
    ["Guests", asNumber(facts?.capacity)?.toLocaleString("en-GB")],
    ["Crew", asNumber(facts?.crew_count)?.toLocaleString("en-GB")],
    ["Decks", asNumber(facts?.deck_count)],
    ["Length", asNumber(facts?.length) ? `${asNumber(facts?.length)} m` : undefined],
    ["Tonnage", asNumber(facts?.gross_tonnage)?.toLocaleString("en-GB")],
  ];

  const useful = [
    practicalItem("Good to know", payload.useful_to_know),
    practicalItem("Gratuities", payload.gratuities),
    practicalItem("Smoking policy", payload.smoking),
    practicalItem("Travelling with children", payload.childrens_facilities),
  ].filter((item): item is ShipContentItem => Boolean(item));

  if (useful.length === 0) {
    useful.push({
      name: "Practical information",
      description:
        "Widgety does not currently provide a dedicated useful-information entry for this ship. We can add verified operator guidance here later.",
    });
  }

  return {
    title,
    summary: concise(payload.teaser, 500),
    overview: concise(payload.introduction, 1500),
    imageUrl: asString(payload.cover_image_href),
    facts: factValues
      .filter((fact): fact is [string, string | number] => fact[1] !== undefined)
      .map(([label, value]) => ({ label, value: String(value) })),
    staterooms: mapSection(payload, "accommodation", "accomodation_types", 6),
    decks: mapDecks(payload.deckplans),
    dining: mapSection(payload, "dining", "dining_options", 6),
    entertainment: mapSection(payload, "entertainment", "entertainment_types", 6),
    healthAndFitness: mapSection(
      payload,
      "health_and_fitness",
      "health_fitness_types",
      6,
    ),
    enrichment: mapSection(payload, "enrichment", "enrichment_types", 6),
    usefulToKnow: useful,
  };
}

const getCachedCelebrityEdge = unstable_cache(
  async () => mapShip(await widgetyRequest("ships/celebrity-edge.json")),
  ["widgety-ship-content", "celebrity-edge", "v1"],
  { revalidate: 3600 },
);

/** Fetches and maps the Celebrity Edge ship content for our prototype. */
export async function getCelebrityEdgeContent(): Promise<WidgetyShipContentResult> {
  try {
    const ship = await getCachedCelebrityEdge();
    return ship
      ? { ship }
      : { message: "Widgety returned an unexpected ship record." };
  } catch {
    // Fetch errors can contain the credential-bearing URL, so do not log them.
    console.error("Could not load the Widgety ship content.");
    return { message: "The Widgety API could not be reached at the moment." };
  }
}
