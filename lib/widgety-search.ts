import "server-only";
import { unstable_cache } from "next/cache";

type RecordValue = Record<string, unknown>;

export type CruiseOperator = { id: string; name: string };
export type CruiseShip = { id: string; name: string; operatorId: string };
export type CruiseDestination = { id: string; name: string };
export type CruiseType = { id: string; name: string };
export type CruiseSearchOptions = {
  operators: CruiseOperator[];
  ships: CruiseShip[];
  destinations: CruiseDestination[];
  types: CruiseType[];
  lastYear: number;
};

export type CruiseResult = {
  id: string;
  name: string;
  operatorId: string;
  operatorName: string;
  shipId: string;
  shipName: string;
  dateFrom: string;
  dateTo: string;
  nights: number;
  types: string[];
  destinations: string[];
  startsAt?: string;
  endsAt?: string;
  imageUrl?: string;
  price?: number;
  availability?: string;
};

export type CruiseSearchResponse = {
  results: CruiseResult[];
  total: number;
  page: number;
  perPage: number;
  message?: string;
};

export type CruiseSearchQuery = {
  months?: string[];
  duration?: string;
  types?: string[];
  destinations?: string[];
  operator?: string;
  ship?: string;
  adultsOnly?: boolean;
  sort?: string;
  page?: number;
  perPage?: number;
};

function record(value: unknown): RecordValue | undefined {
  return typeof value === "object" && value !== null
    ? (value as RecordValue)
    : undefined;
}

function string(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function idFromUrl(value: unknown): string {
  const url = string(value);
  return url?.match(/\/([^/]+)\.json(?:\?|$)/)?.[1] ?? "";
}

function slug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function config() {
  const baseUrl = process.env.WIDGETY_API_URL?.replace(/\/$/, "");
  const appId = process.env.WIDGETY_APP_ID;
  const token = process.env.WIDGETY_API_TOKEN;
  if (!baseUrl || !appId || !token) {
    throw new Error("Widgety API credentials are not configured.");
  }
  return { baseUrl, appId, token };
}

async function request(
  path: string,
  params: URLSearchParams = new URLSearchParams(),
): Promise<RecordValue> {
  const { baseUrl, appId, token } = config();
  const url = new URL(`${baseUrl}/${path}`);
  params.forEach((value, key) => url.searchParams.append(key, value));
  url.searchParams.set("app_id", appId);
  url.searchParams.set("token", token);
  const response = await fetch(url, { cache: "no-store", headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Widgety returned HTTP ${response.status}.`);
  const payload: unknown = await response.json();
  const result = record(payload);
  if (!result) throw new Error("Widgety returned an unexpected response.");
  return result;
}

function mapDate(value: unknown): CruiseResult | undefined {
  const item = record(value);
  const id = string(item?.date_ref);
  const name = string(item?.name);
  const dateFrom = string(item?.date_from);
  if (!item || !id || !name || !dateFrom) return undefined;
  const headline = record(item.headline_prices);
  const cruise = record(headline?.cruise);
  const double = record(cruise?.double);
  const prices = Object.values(double ?? {})
    .map(Number)
    .filter((price) => Number.isFinite(price) && price > 0);
  const startsAt = record(item.starts_at);
  const endsAt = record(item.ends_at);
  return {
    id,
    name,
    operatorId: idFromUrl(item.operator),
    operatorName: string(item.operator_title) ?? "Cruise line",
    shipId: idFromUrl(item.ship),
    shipName: string(item.ship_title) ?? "Ship to be confirmed",
    dateFrom,
    dateTo: string(item.date_to) ?? dateFrom,
    nights: Number(item.cruise_nights ?? item.duration_days ?? 0),
    types: strings(item.holiday_type),
    destinations: strings(item.regions),
    startsAt: string(startsAt?.name),
    endsAt: string(endsAt?.name),
    imageUrl: string(item.image),
    price: prices.length ? Math.min(...prices) : undefined,
    availability: string(item.availability_string),
  };
}

const getOptionsCached = unstable_cache(
  async (): Promise<CruiseSearchOptions> => {
    const operatorsPayload = await request("operators.json", new URLSearchParams({ limit: "100" }));
    const rawOperators = Array.isArray(operatorsPayload.operators) ? operatorsPayload.operators : [];
    const operators = rawOperators.map((value) => {
      const item = record(value);
      return { id: string(item?.id) ?? idFromUrl(item?.href), name: string(item?.title) ?? "" };
    }).filter((item) => item.id && item.name);

    const fleetPayloads = await Promise.all(
      operators.map((operator) => request(`operators/${operator.id}.json`)),
    );
    const ships = fleetPayloads.flatMap((payload, index) => {
      const fleet = Array.isArray(payload.ships) ? payload.ships : [];
      return fleet.map((value) => {
        const ship = record(value);
        return {
          id: string(ship?.id) ?? "",
          name: string(ship?.name) ?? "",
          operatorId: operators[index].id,
        };
      }).filter((ship) => ship.id && ship.name);
    }).sort((a, b) => a.name.localeCompare(b.name));

    const samples = await Promise.all(Array.from({ length: 8 }, (_, index) => {
      const params = baseParams();
      params.set("page", String(index + 1));
      params.set("limit", "25");
      return request("holidays/dates.json", params);
    }));
    const sampleDates = samples.flatMap((payload) => Array.isArray(payload.dates) ? payload.dates : []);
    const destinationNames = [...new Set(sampleDates.flatMap((value) => strings(record(value)?.regions)))];
    const typeIds = [...new Set(sampleDates.flatMap((value) => strings(record(value)?.holiday_type)))];
    const years = sampleDates.map((value) => Number(string(record(value)?.date_from)?.slice(0, 4))).filter(Number.isFinite);
    const popular = ["Mediterranean", "Caribbean", "Alaska", "Northern Europe", "Norwegian Fjords", "Asia", "Australia & New Zealand", "South America", "Galapagos"];
    destinationNames.sort((a, b) => {
      const ai = popular.indexOf(a); const bi = popular.indexOf(b);
      if (ai >= 0 || bi >= 0) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
      return a.localeCompare(b);
    });
    const destinations = destinationNames.map((name) => ({ id: slug(name), name }));
    const typeNames: Record<string, string> = { ocean_cruise: "Ocean cruises", river_cruise: "River cruises", expedition: "Expedition cruises", "cruise&stay": "Cruise and stay", river_cruise_and_stay: "River cruise and stay" };
    const types = typeIds.filter((id) => typeNames[id]).map((id) => ({ id, name: typeNames[id] }));
    return { operators, ships, destinations, types, lastYear: Math.max(2029, ...years) };
  },
  ["widgety-search-options-v3"],
  { revalidate: 3600 },
);

function baseParams() {
  return new URLSearchParams({
    market: "uk",
    availability: "available,limited,enquire",
    show_headlines: "true",
  });
}

function monthBounds(months: string[]) {
  const valid = months.filter((month) => /^\d{4}-(0[1-9]|1[0-2])$/.test(month)).sort();
  if (!valid.length) return undefined;
  const first = valid[0];
  const [year, month] = valid.at(-1)!.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${first}-01`, to: `${year}-${String(month).padStart(2, "0")}-${lastDay}`, valid };
}

export async function getCruiseSearchOptions(): Promise<CruiseSearchOptions> {
  return getOptionsCached();
}

export async function getAvailableCruiseMonths(year: number): Promise<string[]> {
  if (!Number.isInteger(year) || year < new Date().getFullYear() || year > 2035) return [];
  const cached = unstable_cache(
    async () => {
      const payloads = await Promise.all(Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
        const monthValue = String(month).padStart(2, "0");
        const params = baseParams();
        params.set("date_from", `${year}-${monthValue}-01`);
        params.set("date_to", `${year}-${monthValue}-${lastDay}`);
        params.set("limit", "1");
        return request("holidays/dates.json", params);
      }));
      return payloads.flatMap((payload, index) => Number(payload.total ?? 0) > 0
        ? [`${year}-${String(index + 1).padStart(2, "0")}`]
        : []);
    },
    ["widgety-available-months", String(year)],
    { revalidate: 21600 },
  );
  return cached();
}

export async function searchCruises(query: CruiseSearchQuery): Promise<CruiseSearchResponse> {
  const page = Math.max(1, query.page ?? 1);
  const perPage = [15, 25, 50].includes(query.perPage ?? 25) ? query.perPage ?? 25 : 25;
  // Neither currently enabled operator is adults-only. Widgety exposes this
  // classification on ships, not as a supported dated-sailing filter.
  if (query.adultsOnly) return { results: [], total: 0, page, perPage };
  const start = (page - 1) * perPage;
  const firstUpstreamPage = Math.floor(start / 25) + 1;
  const lastUpstreamPage = Math.floor((start + perPage - 1) / 25) + 1;
  const params = baseParams();
  const bounds = monthBounds(query.months ?? []);
  if (bounds) { params.set("date_from", bounds.from); params.set("date_to", bounds.to); }
  else params.set("date_from", new Date().toISOString().slice(0, 10));
  if (query.operator) params.set("operators", query.operator);
  if (query.ship) params.set("ships", query.ship);
  if (query.destinations?.length) params.set("regions", query.destinations.join(","));
  query.types?.forEach((type) => params.append("holiday_types[]", type));
  const durations: Record<string, [number, number?]> = { short: [1, 5], medium: [6, 9], long: [10, 14], extended: [15] };
  const duration = query.duration ? durations[query.duration] : undefined;
  if (duration) { params.set("duration_days_min", String(duration[0])); if (duration[1]) params.set("duration_days_max", String(duration[1])); }
  if (query.sort === "price-asc" || query.sort === "price-desc") {
    params.set("sort_price", query.sort === "price-asc" ? "asc" : "desc");
    params.set("price_occ", "2");
  }

  // Widgety accepts a continuous date range. For separate selected months,
  // query each month independently so totals and pagination remain exact.
  if (bounds && bounds.valid.length > 1) {
    const end = page * perPage;
    const monthParams = bounds.valid.map((value) => {
      const [year, month] = value.split("-").map(Number);
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      const next = new URLSearchParams(params);
      next.set("date_from", `${value}-01`);
      next.set("date_to", `${value}-${lastDay}`);
      next.set("page", "1");
      next.set("limit", "25");
      return next;
    });
    const firstPayloads = await Promise.all(monthParams.map((month) => request("holidays/dates.json", month)));
    const totals = firstPayloads.map((payload) => Number(payload.total ?? 0));
    const remainingPayloads = await Promise.all(monthParams.flatMap((month, monthIndex) => {
      const pagesNeeded = Math.ceil(Math.min(totals[monthIndex], end) / 25);
      return Array.from({ length: Math.max(0, pagesNeeded - 1) }, (_, index) => {
        const next = new URLSearchParams(month);
        next.set("page", String(index + 2));
        return request("holidays/dates.json", next);
      });
    }));
    const results = [...firstPayloads, ...remainingPayloads]
      .flatMap((payload) => Array.isArray(payload.dates) ? payload.dates : [])
      .map(mapDate).filter((item): item is CruiseResult => Boolean(item));
    if (query.sort === "price-asc") results.sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
    else if (query.sort === "price-desc") results.sort((a, b) => (b.price ?? -Infinity) - (a.price ?? -Infinity));
    else results.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
    return { results: results.slice(start, end), total: totals.reduce((sum, total) => sum + total, 0), page, perPage };
  }

  const payloads = await Promise.all(Array.from({ length: lastUpstreamPage - firstUpstreamPage + 1 }, (_, index) => {
    const pageParams = new URLSearchParams(params);
    pageParams.set("page", String(firstUpstreamPage + index));
    pageParams.set("limit", "25");
    return request("holidays/dates.json", pageParams);
  }));
  let results = payloads.flatMap((payload) => Array.isArray(payload.dates) ? payload.dates : [])
    .map(mapDate).filter((item): item is CruiseResult => Boolean(item));
  if (query.sort === "date") results.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
  const offset = start - (firstUpstreamPage - 1) * 25;
  results = results.slice(offset, offset + perPage);
  return {
    results,
    total: Number(payloads[0]?.total ?? results.length),
    page,
    perPage,
  };
}
