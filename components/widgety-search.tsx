import Script from "next/script";

/**
 * Widgety's hosted Cruise & Tour Search.
 * The scripts handle iframe resizing, deep links and the widget's navigation.
 */
export function WidgetySearch() {
  // These are Widgety-specific attributes rather than standard iframe props.
  const widgetyNavigation = {
    "preview-nav": "true",
    "results-nav": "true",
    tabs: "true",
  };

  return (
    <>
      <iframe
        className="widgety-cruise-tour-search widgety-frame"
        frameBorder="0"
        height="600"
        loading="lazy"
        src="https://www.widgety.co.uk/widgets/B2qoyWDJq4zpbobqbA9x.widget"
        title="Search cruise holidays"
        width="100%"
        {...widgetyNavigation}
      />
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
    </>
  );
}
