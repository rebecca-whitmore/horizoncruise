"use client";

import { useRef, useState, type KeyboardEvent } from "react";

type ShipSection = {
  id: string;
  label: string;
  html: string;
};

export function WordPressShipTabs({
  title,
  sections,
}: {
  title: string;
  sections: ShipSection[];
}) {
  const [activeId, setActiveId] = useState(sections[0]?.id ?? "overview");
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const activeSection = sections.find((section) => section.id === activeId);

  function selectTab(index: number) {
    const section = sections[index];
    if (!section) return;
    setActiveId(section.id);
    tabRefs.current[index]?.focus();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      selectTab((index + 1) % sections.length);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      selectTab((index - 1 + sections.length) % sections.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      selectTab(0);
    } else if (event.key === "End") {
      event.preventDefault();
      selectTab(sections.length - 1);
    }
  }

  if (!activeSection) return null;

  return (
    <div className="ship-experience wordpress-ship-experience">
      <div className="ship-tabs" role="tablist" aria-label={`${title} information`}>
        {sections.map((section, index) => (
          <button
            aria-controls={`ship-panel-${section.id}`}
            aria-selected={activeId === section.id}
            className="ship-tab"
            id={`ship-tab-${section.id}`}
            key={section.id}
            onClick={() => setActiveId(section.id)}
            onKeyDown={(event) => handleKeyDown(event, index)}
            ref={(element) => {
              tabRefs.current[index] = element;
            }}
            role="tab"
            tabIndex={activeId === section.id ? 0 : -1}
            type="button"
          >
            {section.label}
          </button>
        ))}
      </div>

      <section
        aria-labelledby={`ship-tab-${activeSection.id}`}
        className="ship-tab-panel"
        id={`ship-panel-${activeSection.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        <article
          className="article-body ship-wordpress-content"
          dangerouslySetInnerHTML={{ __html: activeSection.html }}
        />
      </section>
    </div>
  );
}
