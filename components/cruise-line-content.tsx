import Image from "next/image";
import type { WidgetyCruiseLineContent } from "@/lib/widgety";

export function CruiseLineContent({
  cruiseLine,
}: {
  cruiseLine: WidgetyCruiseLineContent;
}) {
  return (
    <article className="ship-experience cruise-line-experience">
      <header className="ship-profile-hero">
        {cruiseLine.imageUrl ? (
          <Image
            className="ship-profile-image"
            src={cruiseLine.imageUrl}
            alt="Celebrity Cruises ship at sea"
            width={1800}
            height={1000}
            sizes="(max-width: 1160px) 100vw, 1120px"
          />
        ) : null}
        <div className="ship-profile-overlay" />
        <div className="ship-profile-heading">
          <p className="playground-label">Cruise line profile</p>
          <h3>{cruiseLine.title}</h3>
          <p>{cruiseLine.introduction}</p>
        </div>
      </header>

      <div className="cruise-line-body">
        <div className="cruise-line-introduction">
          <p className="playground-label">The Celebrity experience</p>
          <h4>More than a way to travel</h4>
          <p>
            Explore the style, spaces, dining, entertainment and wellbeing
            experiences that shape a Celebrity Cruises holiday.
          </p>
          {cruiseLine.shipCount ? (
            <p className="cruise-line-fleet-note">
              The current Widgety profile includes {cruiseLine.shipCount} ships
              in the Celebrity fleet.
            </p>
          ) : null}
        </div>

        <div className="cruise-line-sections">
          {cruiseLine.sections.map((section) => (
            <section key={section.heading}>
              <h5>{section.heading}</h5>
              <p>{section.body}</p>
            </section>
          ))}
        </div>
      </div>
    </article>
  );
}
