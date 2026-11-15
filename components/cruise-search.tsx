"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CruiseSearchOptions, CruiseSearchQuery, CruiseSearchResponse } from "@/lib/widgety-search";

type Props = { options: CruiseSearchOptions; initial: CruiseSearchResponse };
type View = "grid" | "list";
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const defaultFilters: CruiseSearchQuery = { months: [], types: [], destinations: [], sort: "date", page: 1, perPage: 25 };

function dateLabel(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(value));
}

function typeLabel(value: string) {
  return ({ ocean_cruise: "Ocean cruise", river_cruise: "River cruise", expedition: "Expedition cruise" } as Record<string, string>)[value] ?? value;
}

export default function CruiseSearch({ options, initial }: Props) {
  const startYear = new Date().getFullYear();
  const [filters, setFilters] = useState<CruiseSearchQuery>(defaultFilters);
  const [year, setYear] = useState(startYear);
  const [availableMonths, setAvailableMonths] = useState<Record<number, string[] | undefined>>({});
  const [data, setData] = useState(initial);
  const [view, setView] = useState<View>("grid");
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const firstRender = useRef(true);

  useEffect(() => {
    if (availableMonths[year]) return;
    const controller = new AbortController();
    fetch(`/api/cruise-search/months?year=${year}`, { signal: controller.signal })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((payload: { months: string[] }) => setAvailableMonths((current) => ({ ...current, [year]: payload.months })))
      .catch(() => { if (!controller.signal.aborted) setAvailableMonths((current) => ({ ...current, [year]: [] })); });
    return () => controller.abort();
  }, [availableMonths, year]);

  useEffect(() => {
    if (firstRender.current) { firstRender.current = false; return; }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      const query = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length) query.set(key, value.join(","));
        else if (typeof value === "boolean") query.set(key, String(value));
        else if (value !== undefined && value !== "") query.set(key, String(value));
      });
      try {
        const response = await fetch(`/api/cruise-search?${query}`, { signal: controller.signal });
        const result = await response.json() as CruiseSearchResponse;
        if (!response.ok) throw new Error(result.message);
        setData(result);
      } catch (caught) {
        if ((caught as Error).name !== "AbortError") setError("We could not refresh the cruise results. Please try again.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
    }, 350);
    return () => { window.clearTimeout(timer); controller.abort(); };
  }, [filters]);

  const ships = useMemo(() => options.ships.filter((ship) => !filters.operator || ship.operatorId === filters.operator), [filters.operator, options.ships]);
  const visibleDestinations = showAllDestinations ? options.destinations : options.destinations.slice(0, 7);
  const pageCount = Math.max(1, Math.ceil(data.total / data.perPage));

  function update(patch: Partial<CruiseSearchQuery>) { setFilters((current) => ({ ...current, ...patch, page: 1 })); }
  function toggleList(key: "types" | "destinations", value: string) {
    const current = filters[key] ?? [];
    update({ [key]: current.includes(value) ? current.filter((item) => item !== value) : [...current, value] });
  }
  function changeOperator(operator: string) {
    const selectedShip = options.ships.find((ship) => ship.id === filters.ship);
    update({ operator: operator || undefined, ship: selectedShip && operator && selectedShip.operatorId !== operator ? undefined : filters.ship });
  }
  function clearAll() { setFilters(defaultFilters); }
  const chips = [
    ...(filters.months ?? []).map((value) => ({ label: `${months[Number(value.slice(5)) - 1]} ${value.slice(0, 4)}`, remove: () => update({ months: (filters.months ?? []).filter((item)=>item!==value) }) })),
    ...(filters.types ?? []).map((value) => ({ label: typeLabel(value), remove: () => toggleList("types", value) })),
    ...(filters.destinations ?? []).map((value) => ({ label: options.destinations.find((item)=>item.id===value)?.name ?? value, remove: () => toggleList("destinations", value) })),
  ];
  if (filters.duration) chips.push({ label: ({ short:"1–5 nights", medium:"6–9 nights", long:"10–14 nights", extended:"15+ nights" } as Record<string,string>)[filters.duration], remove: () => update({ duration: undefined }) });
  if (filters.operator) chips.push({ label: options.operators.find((item)=>item.id===filters.operator)?.name ?? filters.operator, remove: () => update({ operator: undefined }) });
  if (filters.ship) chips.push({ label: options.ships.find((item)=>item.id===filters.ship)?.name ?? filters.ship, remove: () => update({ ship: undefined }) });

  return <main className="cruise-search-page">
    <header className="cruise-search-hero">
      <div className="cruise-search-shell"><p className="eyebrow">Explore by land and sea</p><h1>Find your cruise</h1><p>Search live sailings from our currently connected cruise lines. More fleets will appear here as they are enabled.</p></div>
    </header>
    <div className="cruise-search-shell">
      <div className="search-layout">
        <aside className="search-filters" aria-label="Cruise filters">
          <div className="filter-intro"><p className="eyebrow">Refine your search</p><h2>Choose your journey</h2><p>Select as much or as little as you like.</p></div>
          <section className="filter-section"><h3>Departure date</h3>
            <div className="year-picker"><button type="button" onClick={()=>setYear((value)=>Math.max(startYear,value-1))} disabled={year<=startYear} aria-label="Previous year">‹</button><strong>{year}</strong><button type="button" onClick={()=>setYear((value)=>value+1)} aria-label="Next year">›</button></div>
            <div className="month-grid" aria-busy={availableMonths[year]===undefined}>{months.map((name,index)=>{const value=`${year}-${String(index+1).padStart(2,"0")}`;const selected=(filters.months??[]).includes(value);const unavailable=Boolean(availableMonths[year])&&!availableMonths[year]?.includes(value);return <button key={value} type="button" aria-pressed={selected} disabled={unavailable} title={unavailable?"No connected sailings currently available":""} onClick={()=>update({months:selected?(filters.months??[]).filter((item)=>item!==value):[...(filters.months??[]),value].sort()})}>{name}</button>})}</div>
            {year > options.lastYear && <p className="filter-help">No current sailings are loaded this far ahead yet. The calendar is ready when they are added.</p>}
            {(filters.months??[]).length>0&&<button className="reset-dates" type="button" onClick={()=>update({months:[]})}>Reset departure dates</button>}
          </section>
          <label className="filter-section"><span className="filter-label">Duration</span><select value={filters.duration ?? ""} onChange={(event)=>update({duration:event.target.value||undefined})}><option value="">Any duration</option><option value="short">1–5 nights</option><option value="medium">6–9 nights</option><option value="long">10–14 nights</option><option value="extended">15 nights +</option></select></label>
          {options.types.length>0&&<fieldset className="filter-section"><legend>Type of cruise</legend>{options.types.map((item)=><label className="check-row" key={item.id}><input type="checkbox" checked={(filters.types??[]).includes(item.id)} onChange={()=>toggleList("types",item.id)}/><span>{item.name}</span></label>)}</fieldset>}
          <fieldset className="filter-section"><legend>Destination</legend>{visibleDestinations.map((item)=><label className="check-row" key={item.id}><input type="checkbox" checked={(filters.destinations??[]).includes(item.id)} onChange={()=>toggleList("destinations",item.id)}/><span>{item.name}</span></label>)}{options.destinations.length>7&&<button className="show-more" type="button" onClick={()=>setShowAllDestinations((value)=>!value)}>{showAllDestinations?"Show fewer":"Show more"}</button>}</fieldset>
          <label className="filter-section"><span className="filter-label">Cruise line</span><select value={filters.operator??""} onChange={(event)=>changeOperator(event.target.value)}><option value="">All cruise lines</option>{options.operators.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <label className="filter-section"><span className="filter-label">Ship</span><select value={filters.ship??""} onChange={(event)=>update({ship:event.target.value||undefined})}><option value="">All ships</option>{ships.map((item)=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
          <div className="filter-actions"><button type="button" onClick={clearAll}>Clear all filters</button></div>
        </aside>
        <section className="search-results" aria-live="polite" aria-busy={loading}>
          <div className="results-toolbar"><div className="toolbar-controls"><label>Order by <select value={filters.sort} onChange={(event)=>update({sort:event.target.value})}><option value="date">Departure date</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select></label><div className="view-toggle" aria-label="Result view"><button type="button" aria-pressed={view==="list"} onClick={()=>setView("list")} title="List view">☷</button><button type="button" aria-pressed={view==="grid"} onClick={()=>setView("grid")} title="Grid view">▦</button></div></div></div>
          {chips.length>0&&<div className="filter-chips" aria-label="Selected filters">{chips.map((chip,index)=><button type="button" key={`${chip.label}-${index}`} onClick={chip.remove}>{chip.label}<span aria-hidden="true">×</span><span className="sr-only">Remove</span></button>)}</div>}
          {data.message&&<p className="search-note">{data.message}</p>}{error&&<p className="search-error">{error}</p>}
          <div className={`cruise-results ${view}`}>{loading ? Array.from({length:Math.min(Number(filters.perPage??25),6)},(_,index)=><div className="cruise-card cruise-card-skeleton" key={index} aria-hidden="true"><div className="cruise-card-media"/><div className="cruise-card-copy"><span/><strong/><span/><span/></div></div>) : data.results.length ? data.results.map((cruise)=><article className="cruise-card" key={cruise.id}>
            <div className="cruise-card-media">{cruise.imageUrl?<Image src={cruise.imageUrl} alt="" fill sizes={view==="grid"?"(max-width: 900px) 100vw, 33vw":"(max-width: 900px) 100vw, 38vw"}/>:<div className="cruise-image-fallback">Horizon Cruise</div>}</div>
            <div className="cruise-card-copy"><div className="cruise-card-top"><p>{cruise.operatorName}</p>{cruise.price&&<p className="cruise-price"><span>From</span> £{Math.round(cruise.price).toLocaleString("en-GB")}<small>pp</small></p>}</div><h3>{cruise.name}</h3><p className="cruise-route">{[cruise.startsAt,cruise.endsAt].filter(Boolean).join(" to ")}</p><dl><div><dt>Departs</dt><dd>{dateLabel(cruise.dateFrom)}</dd></div><div><dt>Duration</dt><dd>{cruise.nights} nights</dd></div><div><dt>Ship</dt><dd>{cruise.shipName}</dd></div><div><dt>Region</dt><dd>{cruise.destinations[0]??"Multiple destinations"}</dd></div></dl></div>
          </article>):<div className="empty-results"><h3>No sailings match those filters</h3><p>Remove one or two selections to broaden your search.</p><button type="button" onClick={clearAll}>Clear all filters</button></div>}</div>
          <div className="results-footer"><label>Show <select value={filters.perPage} onChange={(event)=>update({perPage:Number(event.target.value)})}>{[15,25,50].map((value)=><option key={value}>{value}</option>)}</select> per page</label><div className="pagination"><button type="button" disabled={(filters.page??1)<=1} onClick={()=>setFilters((current)=>({...current,page:(current.page??1)-1}))}>Previous</button><span>Page {filters.page??1} of {pageCount}</span><button type="button" disabled={(filters.page??1)>=pageCount} onClick={()=>setFilters((current)=>({...current,page:(current.page??1)+1}))}>Next</button></div></div>
        </section>
      </div>
    </div>
  </main>;
}
