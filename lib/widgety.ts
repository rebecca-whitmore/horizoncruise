/**
 * Server-only helpers for Widgety's API.
 *
 * Never move the APP ID or token into a NEXT_PUBLIC_ environment variable:
 * doing so would expose the credentials to every site visitor.
 */

type WidgetyRecord = Record<string, unknown>;

export type WidgetyShipsResult = {
  ships: WidgetyRecord[];
  message?: string;
};

function getWidgetyConfig() {
  const baseUrl = process.env.WIDGETY_API_URL?.replace(/\/$/, "");
  const appId = process.env.WIDGETY_APP_ID;
  const token = process.env.WIDGETY_API_TOKEN;

  if (!baseUrl || !appId || !token) {
    throw new Error("Widgety API credentials are not configured.");
  }

  return { baseUrl, appId, token };
}

function findShips(payload: unknown): WidgetyRecord[] {
  if (Array.isArray(payload)) {
    return payload.filter(
      (item): item is WidgetyRecord =>
        typeof item === "object" && item !== null,
    );
  }

  if (typeof payload !== "object" || payload === null) return [];

  const object = payload as WidgetyRecord;
  const possibleLists = [object.ships, object.results, object.data];
  const list = possibleLists.find(Array.isArray);

  return Array.isArray(list)
    ? list.filter(
        (item): item is WidgetyRecord =>
          typeof item === "object" && item !== null,
      )
    : [];
}

/**
 * Fetches the ships enabled for this APP key. The request runs on the server,
 * so neither credential is included in the browser's HTML or JavaScript.
 */
export async function getWidgetyShips(): Promise<WidgetyShipsResult> {
  try {
    const { baseUrl, appId, token } = getWidgetyConfig();
    const url = new URL(`${baseUrl}/ships.json`);
    url.searchParams.set("app_id", appId);
    url.searchParams.set("token", token);
    // One record is enough to prove that this trial key can read ship data.
    url.searchParams.set("limit", "1");

    const response = await fetch(url, {
      // Avoid putting a credential-bearing request URL into Next's data cache.
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      return {
        ships: [],
        message: `Widgety returned HTTP ${response.status}.`,
      };
    }

    const payload: unknown = await response.json();
    const ships = findShips(payload);

    return {
      ships,
      message:
        ships.length === 0
          ? "The API connected, but no ships were present in the response."
          : undefined,
    };
  } catch {
    // Some fetch errors contain the full request URL, including its query
    // string, so deliberately do not write the error object to server logs.
    console.error("Could not load Widgety ships.");

    return {
      ships: [],
      message: "The Widgety API could not be reached at the moment.",
    };
  }
}
