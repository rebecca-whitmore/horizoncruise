"use client";

import Image from "next/image";
import { useRef, useState, type KeyboardEvent } from "react";
import type {
  ShipContentItem,
  ShipContentSection,
  WidgetyShipContent,
} from "@/lib/widgety";

const tabs = [
  ["overview", "Overview"],
  ["staterooms", "Staterooms"],
  ["deck-plans", "Deck plans"],
  ["dining", "Dining"],
  ["entertainment", "Entertainment"],
  ["health-fitness", "Health & fitness"],
  ["enrichment", "Enrichment"],
  ["useful", "Useful to know"],
] as const;

type TabId = (typeof tabs)[number][0];

function ContentCards({ items }: { items: ShipContentItem[] }) {
  return (
    <div className="ship-content-grid">
      {items.map((item) => (
        <article className="ship-content-card" key={item.name}>
          {item.imageUrl ? (
            <Image
              className="ship-content-card-image"
              src={item.imageUrl}
              alt=""
              width={800}
              height={520}
              sizes="(max-width: 760px) 100vw, 33vw"
            />
          ) : null}
          <div className="ship-content-card-copy">
            {item.meta ? <p className="ship-card-meta">{item.meta}</p> : null}
            <h4>{item.name}</h4>
            <p>{item.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}

function ContentSection({
  section,
  noun,
}: {
  section: ShipContentSection;
  noun: string;
}) {
  return (
    <div>
      {section.intro ? <p className="ship-tab-intro">{section.intro}</p> : null}
      <ContentCards items={section.items} />
      {section.totalItems > section.items.length ? (
        <p className="ship-content-note">
          Showing {section.items.length} representative {noun} from {section.totalItems} supplied by Widgety.
        </p>
      ) : null}
    </div>
  );
}

export function ShipContentTabs({ ship }: { ship: WidgetyShipContent }) {
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activeDeck, setActiveDeck] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const selectedDeck = ship.decks[activeDeck];

  function selectTab(index: number) {
    const [id] = tabs[index];
    setActiveTab(id);
    tabRefs.current[index]?.focus();
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab((index + 1) % tabs.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab((index - 1 + tabs.length) % tabs.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(tabs.length - 1);
    }
  }

  return (
    <div className="ship-experience">
      <header className="ship-profile-hero">
        {ship.imageUrl ? (
          <Image
            className="ship-profile-image"
            src={ship.imageUrl}
            alt={`${ship.title} at sea`}
            width={1800}
            height={1000}
            priority={false}
            sizes="(max-width: 1160px) 100vw, 1120px"
          />
        ) : null}
        <div className="ship-profile-overlay" />
        <div className="ship-profile-heading">
          <p className="playground-label">Celebrity Cruises</p>
          <h3>{ship.title}</h3>
          <p>{ship.summary}</p>
        </div>
      </header>

      <div className="ship-tabs" role="tablist" aria-label={`${ship.title} information`}>
        {tabs.map(([id, label], index) => (
          <button
            aria-controls={`ship-panel-${id}`}
            aria-selected={activeTab === id}
            className="ship-tab"
            id={`ship-tab-${id}`}
            key={id}
            onClick={() => setActiveTab(id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
            ref={(element) => { tabRefs.current[index] = element; }}
            role="tab"
            tabIndex={activeTab === id ? 0 : -1}
            type="button"
          >
            {label}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`ship-tab-${activeTab}`}
        className="ship-tab-panel"
        id={`ship-panel-${activeTab}`}
        role="tabpanel"
        tabIndex={0}
      >
        {activeTab === "overview" ? (
          <div className="ship-overview">
            <div>
              <p className="playground-label">About the ship</p>
              <h4>Designed around the sea</h4>
              <p className="ship-tab-intro">{ship.overview}</p>
            </div>
            <dl className="ship-facts">
              {ship.facts.map((fact) => (
                <div key={fact.label}>
                  <dt>{fact.label}</dt>
                  <dd>{fact.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : null}

        {activeTab === "staterooms" ? (
          <ContentSection section={ship.staterooms} noun="stateroom types" />
        ) : null}

        {activeTab === "deck-plans" && selectedDeck ? (
          <div className="deck-plan-layout">
            <nav className="deck-list" aria-label="Choose a deck plan">
              {ship.decks.map((deck, index) => (
                <button
                  aria-current={activeDeck === index ? "true" : undefined}
                  key={deck.name}
                  onClick={() => setActiveDeck(index)}
                  type="button"
                >
                  {deck.name}
                </button>
              ))}
            </nav>
            <article className="deck-plan-view">
              <div>
                <p className="playground-label">Deck plan</p>
                <h4>{selectedDeck.name}</h4>
                <p>{selectedDeck.description}</p>
              </div>
              {selectedDeck.imageUrl ? (
                <Image
                  className="deck-plan-image"
                  src={selectedDeck.imageUrl}
                  alt={`${ship.title} ${selectedDeck.name} deck plan`}
                  width={1200}
                  height={1600}
                  sizes="(max-width: 760px) 100vw, 65vw"
                />
              ) : null}
            </article>
          </div>
        ) : null}

        {activeTab === "dining" ? (
          <ContentSection section={ship.dining} noun="dining venues" />
        ) : null}
        {activeTab === "entertainment" ? (
          <ContentSection section={ship.entertainment} noun="entertainment venues" />
        ) : null}
        {activeTab === "health-fitness" ? (
          <ContentSection section={ship.healthAndFitness} noun="wellness spaces" />
        ) : null}
        {activeTab === "enrichment" ? (
          <ContentSection section={ship.enrichment} noun="enrichment experiences" />
        ) : null}
        {activeTab === "useful" ? <ContentCards items={ship.usefulToKnow} /> : null}
      </section>
    </div>
  );
}
