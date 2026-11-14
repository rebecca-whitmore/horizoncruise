"use client";

import Script from "next/script";
import { useMemo, useState, type FormEvent } from "react";

const WIDGET_BASE =
  "https://www.widgety.co.uk/widgets/B2qoyWDJq4zpbobqbA9x/holidays/result.widget";

type SearchFilters = {
  holidayType: string;
  operatorId: string;
  dateFrom: string;
  dateTo: string;
  duration: string;
  price: string;
};

const initialFilters: SearchFilters = {
  holidayType: "cruise",
  operatorId: "",
  dateFrom: "",
  dateTo: "",
  duration: "",
  price: "",
};

function buildWidgetUrl(filters: SearchFilters) {
  const url = new URL(WIDGET_BASE);

  if (filters.holidayType) {
    url.searchParams.set("holiday_type", filters.holidayType);
  }
  if (filters.operatorId) {
    url.searchParams.append("operator_ids[]", filters.operatorId);
  }
  if (filters.dateFrom) url.searchParams.set("date_from", filters.dateFrom);
  if (filters.dateTo) url.searchParams.set("date_to", filters.dateTo);

  const [durationMin, durationMax] = filters.duration.split(":");
  if (durationMin) url.searchParams.set("duration_days_min", durationMin);
  if (durationMax) url.searchParams.set("duration_days_max", durationMax);

  const [priceMin, priceMax] = filters.price.split(":");
  if (priceMin) url.searchParams.set("price_min", priceMin);
  if (priceMax) url.searchParams.set("price_max", priceMax);

  return url.toString();
}

export function WidgetyHolidayResults() {
  const [draft, setDraft] = useState<SearchFilters>(initialFilters);
  const [applied, setApplied] = useState<SearchFilters>(initialFilters);
  const iframeUrl = useMemo(() => buildWidgetUrl(applied), [applied]);

  function updateFilter(name: keyof SearchFilters, value: string) {
    setDraft((current) => ({ ...current, [name]: value }));
  }

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApplied({ ...draft });
  }

  function clearFilters() {
    setDraft(initialFilters);
    setApplied(initialFilters);
  }

  const widgetAttributes = {
    "preview-nav": "true",
    "results-nav": "true",
  };

  return (
    <div className="holiday-search-layout">
      <aside className="holiday-filter-panel" aria-labelledby="filter-title">
        <div className="holiday-filter-heading">
          <p className="playground-label">Refine your search</p>
          <h2 id="filter-title">Find your cruise</h2>
          <p>Choose as much or as little as you like.</p>
        </div>

        <form onSubmit={applyFilters}>
          <label className="holiday-filter-field">
            <span>Holiday type</span>
            <select
              value={draft.holidayType}
              onChange={(event) => updateFilter("holidayType", event.target.value)}
            >
              <option value="">All holiday types</option>
              <option value="cruise">Cruise</option>
              <option value="ocean_cruise">Ocean cruise</option>
              <option value="river_cruise">River cruise</option>
              <option value="expedition">Expedition</option>
            </select>
          </label>

          <label className="holiday-filter-field">
            <span>Cruise line</span>
            <select
              value={draft.operatorId}
              onChange={(event) => updateFilter("operatorId", event.target.value)}
            >
              <option value="">All cruise lines</option>
              <option value="12">Celebrity Cruises</option>
            </select>
          </label>

          <fieldset className="holiday-filter-group">
            <legend>Departure dates</legend>
            <label>
              <span>From</span>
              <input
                type="date"
                value={draft.dateFrom}
                onChange={(event) => updateFilter("dateFrom", event.target.value)}
              />
            </label>
            <label>
              <span>To</span>
              <input
                min={draft.dateFrom || undefined}
                type="date"
                value={draft.dateTo}
                onChange={(event) => updateFilter("dateTo", event.target.value)}
              />
            </label>
          </fieldset>

          <label className="holiday-filter-field">
            <span>Duration</span>
            <select
              value={draft.duration}
              onChange={(event) => updateFilter("duration", event.target.value)}
            >
              <option value="">Any duration</option>
              <option value="1:5">1–5 days</option>
              <option value="6:9">6–9 days</option>
              <option value="10:14">10–14 days</option>
              <option value="15:">15+ days</option>
            </select>
          </label>

          <label className="holiday-filter-field">
            <span>Headline price per person</span>
            <select
              value={draft.price}
              onChange={(event) => updateFilter("price", event.target.value)}
            >
              <option value="">Any price</option>
              <option value="0:999">Up to £999</option>
              <option value="1000:1999">£1,000–£1,999</option>
              <option value="2000:3999">£2,000–£3,999</option>
              <option value="4000:">£4,000+</option>
            </select>
          </label>

          <div className="holiday-filter-actions">
            <button className="holiday-search-button" type="submit">
              Show cruises
            </button>
            <button className="holiday-clear-button" onClick={clearFilters} type="button">
              Clear filters
            </button>
          </div>
        </form>

        <p className="holiday-filter-note">
          Prototype: cruise type and Celebrity Cruises are verified Smart Link
          filters. Date, duration and price are being tested against Widgety&apos;s
          undocumented URL handling.
        </p>
      </aside>

      <section className="holiday-results-panel" aria-labelledby="results-title">
        <div className="holiday-results-heading">
          <div>
            <p className="playground-label">Live Widgety content</p>
            <h2 id="results-title">Cruise results</h2>
          </div>
          <p>Choose “Learn More” to continue inside the widget.</p>
        </div>

        <div className="holiday-widget-frame">
          <iframe
            key={iframeUrl}
            className="widgety-cruise-tour-search"
            frameBorder="0"
            height="1400"
            loading="eager"
            src={iframeUrl}
            title="Widgety cruise holiday results"
            width="100%"
            {...widgetAttributes}
          />
        </div>

        <Script
          data-widgety="true"
          src="https://www.widgety.co.uk/assets/widgety_iframe-658243d39a391198be5fa17e9722bf76016bde72adbd974a7972a844910302d7.js"
          strategy="afterInteractive"
        />
        <Script
          data-widgety="true"
          src="https://www.widgety.co.uk/assets/deep_linking_iframe-96ca31e40c8ae6e4a72211018719c609dddc638f8767b1df287e76832e4b953e.js"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.widgety.co.uk/assets/widgety_cruise_tour_search_navigation_script-e5c46a5521b82182ecdc1564d7f90c5cfb653f3ffed29c4220e85749607af1de.js"
          strategy="afterInteractive"
        />
      </section>
    </div>
  );
}
